import { storage } from "../storage";
import type { Coin } from "@shared/schema";

export interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: Date;
}

export interface OHLCV {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class CryptoDataService {
  private apiKey: string;
  private baseUrls = {
    coingecko: 'https://api.coingecko.com/api/v3',
    cryptocompare: 'https://min-api.cryptocompare.com/data/v2',
    binance: 'https://api.binance.com/api/v3'
  };

  constructor() {
    this.apiKey = process.env.CRYPTO_API_KEY || process.env.COINGECKO_API_KEY || '';
  }

  async getCurrentPrices(symbols: string[]): Promise<CryptoPrice[]> {
    try {
      // Try CoinGecko first
      const coinGeckoIds = this.symbolsToCoinGeckoIds(symbols);
      const url = `${this.baseUrls.coingecko}/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;
      
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['X-CG-Demo-API-Key'] = this.apiKey;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      return symbols.map(symbol => {
        const coinId = this.symbolToCoinGeckoId(symbol);
        const coinData = data[coinId];
        
        return {
          symbol,
          price: coinData?.usd || 0,
          change24h: coinData?.usd_24h_change || 0,
          volume24h: coinData?.usd_24h_vol || 0,
          timestamp: new Date()
        };
      });
    } catch (error) {
      console.error('Error fetching current prices:', error);
      // Return mock data as fallback for development
      return this.getMockPrices(symbols);
    }
  }

  async getHistoricalData(symbol: string, timeframe: string, limit = 100): Promise<OHLCV[]> {
    try {
      // Convert timeframe to CoinGecko format
      const days = this.timeframeToDays(timeframe, limit);
      const coinId = this.symbolToCoinGeckoId(symbol);
      
      const url = `${this.baseUrls.coingecko}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;
      
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['X-CG-Demo-API-Key'] = this.apiKey;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`CoinGecko OHLC API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.map((item: number[]) => ({
        timestamp: new Date(item[0]),
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
        volume: Math.random() * 1000000 // CoinGecko OHLC doesn't include volume
      })).slice(-limit);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      // Return mock data as fallback
      return this.getMockOHLCV(symbol, limit);
    }
  }

  async getFearGreedIndex(): Promise<number> {
    try {
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json();
      return parseInt(data.data[0].value);
    } catch (error) {
      console.error('Error fetching Fear & Greed index:', error);
      return 52; // Default neutral value
    }
  }

  private symbolsToCoinGeckoIds(symbols: string[]): string[] {
    return symbols.map(symbol => this.symbolToCoinGeckoId(symbol));
  }

  private symbolToCoinGeckoId(symbol: string): string {
    const mapping: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'LINK': 'chainlink',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2',
      'UNI': 'uniswap',
      'ATOM': 'cosmos'
    };
    return mapping[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  private timeframeToDays(timeframe: string, limit: number): number {
    const multipliers: Record<string, number> = {
      '5m': 1/288,
      '15m': 1/96,
      '1h': 1/24,
      '4h': 1/6,
      '1d': 1,
      '1w': 7,
      '1mo': 30
    };
    
    const multiplier = multipliers[timeframe] || 1;
    return Math.max(1, Math.ceil(limit * multiplier));
  }

  private getMockPrices(symbols: string[]): CryptoPrice[] {
    const basePrices: Record<string, number> = {
      'BTC': 43254.32,
      'ETH': 2643.89,
      'SOL': 98.45,
      'ADA': 0.52,
      'DOT': 7.23,
      'LINK': 14.67,
      'MATIC': 0.89,
      'AVAX': 36.78,
      'UNI': 6.45,
      'ATOM': 9.87
    };

    return symbols.map(symbol => ({
      symbol,
      price: basePrices[symbol] || 100,
      change24h: (Math.random() - 0.5) * 10,
      volume24h: Math.random() * 1000000000,
      timestamp: new Date()
    }));
  }

  private getMockOHLCV(symbol: string, limit: number): OHLCV[] {
    const basePrice = 43254.32;
    const data: OHLCV[] = [];
    let currentPrice = basePrice;

    for (let i = limit - 1; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 60 * 60 * 1000); // 1 hour intervals
      const variation = (Math.random() - 0.5) * 0.02; // 2% max variation
      
      const open = currentPrice;
      const close = open * (1 + variation);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.random() * 1000000;

      data.push({ timestamp, open, high, low, close, volume });
      currentPrice = close;
    }

    return data;
  }

  async updateCoinPrices(): Promise<void> {
    try {
      const coins = await storage.getAllCoins();
      const symbols = coins.map(coin => coin.symbol);
      const prices = await this.getCurrentPrices(symbols);

      for (const price of prices) {
        const coin = await storage.getCoinBySymbol(price.symbol);
        if (coin) {
          await storage.updateCoin(coin.id, {
            currentPrice: price.price.toString(),
            priceChange24h: price.change24h.toString(),
            volume24h: price.volume24h.toString(),
          });
        }
      }
    } catch (error) {
      console.error('Error updating coin prices:', error);
    }
  }
}

export const cryptoDataService = new CryptoDataService();
