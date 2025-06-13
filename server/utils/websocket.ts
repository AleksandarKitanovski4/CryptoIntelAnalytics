import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { cryptoDataService } from '../services/cryptoData';
import { storage } from '../storage';
import { TechnicalIndicators } from '../services/indicators';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

export class CryptoWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private priceUpdateInterval: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      clientTracking: true 
    });
    
    this.setupWebSocketServer();
    this.startPriceUpdates();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket client connected');
      this.clients.add(ws);

      // Send initial data
      this.sendInitialData(ws);

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  private async sendInitialData(ws: WebSocket) {
    try {
      // Send current coins
      const coins = await storage.getAllCoins();
      this.sendToClient(ws, {
        type: 'INITIAL_COINS',
        data: coins,
        timestamp: new Date()
      });

      // Send fear & greed index
      const fearGreedIndex = await cryptoDataService.getFearGreedIndex();
      this.sendToClient(ws, {
        type: 'FEAR_GREED_INDEX',
        data: { value: fearGreedIndex },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }

  private async handleClientMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case 'SUBSCRIBE_COIN':
        await this.handleCoinSubscription(ws, message.data);
        break;
      case 'REQUEST_INDICATORS':
        await this.handleIndicatorRequest(ws, message.data);
        break;
      case 'REQUEST_HISTORICAL_DATA':
        await this.handleHistoricalDataRequest(ws, message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private async handleCoinSubscription(ws: WebSocket, data: any) {
    const { symbol, timeframe } = data;
    
    try {
      const coin = await storage.getCoinBySymbol(symbol);
      if (!coin) return;

      // Send historical price data
      const historicalData = await cryptoDataService.getHistoricalData(symbol, timeframe, 100);
      
      // Store price data
      for (const ohlcv of historicalData) {
        await storage.createPriceData({
          coinId: coin.id,
          timeframe,
          timestamp: ohlcv.timestamp,
          open: ohlcv.open.toString(),
          high: ohlcv.high.toString(),
          low: ohlcv.low.toString(),
          close: ohlcv.close.toString(),
          volume: ohlcv.volume.toString()
        });
      }

      // Calculate and store indicators
      const indicators = TechnicalIndicators.calculateAll(historicalData);
      
      // Store RSI
      if (indicators.rsi && indicators.rsi.length > 0) {
        await storage.createIndicator({
          coinId: coin.id,
          timeframe,
          timestamp: new Date(),
          indicatorType: 'RSI',
          values: { current: indicators.rsi[indicators.rsi.length - 1] }
        });
      }

      // Store MACD
      if (indicators.macd) {
        await storage.createIndicator({
          coinId: coin.id,
          timeframe,
          timestamp: new Date(),
          indicatorType: 'MACD',
          values: {
            macd: indicators.macd.macd[indicators.macd.macd.length - 1] || 0,
            signal: indicators.macd.signal[indicators.macd.signal.length - 1] || 0,
            histogram: indicators.macd.histogram[indicators.macd.histogram.length - 1] || 0
          }
        });
      }

      // Send chart data
      this.sendToClient(ws, {
        type: 'CHART_DATA',
        data: {
          symbol,
          timeframe,
          ohlcv: historicalData,
          indicators
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling coin subscription:', error);
    }
  }

  private async handleIndicatorRequest(ws: WebSocket, data: any) {
    const { coinId, timeframe, indicatorType } = data;
    
    try {
      const indicators = await storage.getIndicators(coinId, timeframe, indicatorType);
      
      this.sendToClient(ws, {
        type: 'INDICATOR_DATA',
        data: {
          coinId,
          timeframe,
          indicatorType,
          indicators
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling indicator request:', error);
    }
  }

  private async handleHistoricalDataRequest(ws: WebSocket, data: any) {
    const { coinId, timeframe, limit = 100 } = data;
    
    try {
      const priceData = await storage.getPriceData(coinId, timeframe, limit);
      
      this.sendToClient(ws, {
        type: 'HISTORICAL_DATA',
        data: {
          coinId,
          timeframe,
          priceData
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling historical data request:', error);
    }
  }

  private startPriceUpdates() {
    // Update prices every 30 seconds
    this.priceUpdateInterval = setInterval(async () => {
      try {
        await cryptoDataService.updateCoinPrices();
        
        // Get updated coins and broadcast to all clients
        const coins = await storage.getAllCoins();
        this.broadcast({
          type: 'PRICE_UPDATE',
          data: coins,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error in price update interval:', error);
      }
    }, 30000);
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcast(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  public close() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.close();
      }
    });
    
    this.wss.close();
  }
}
