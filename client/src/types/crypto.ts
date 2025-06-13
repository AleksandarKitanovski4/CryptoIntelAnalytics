export interface CoinData {
  id: number;
  symbol: string;
  name: string;
  currentPrice: string;
  priceChange24h: string;
  volume24h: string;
  marketCap: string;
  lastUpdated: Date;
}

export interface PriceData {
  id: number;
  coinId: number;
  timeframe: string;
  timestamp: Date;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface IndicatorData {
  id: number;
  coinId: number;
  timeframe: string;
  timestamp: Date;
  indicatorType: string;
  values: Record<string, number>;
}

export interface ChatMessage {
  id: number;
  userId: number;
  message: string;
  response: string;
  timestamp: Date;
}

export interface UserPreferences {
  id: number;
  userId: number;
  selectedCoins: string[];
  selectedTimeframe: string;
  selectedIndicators: string[];
  theme: string;
}

export interface MarketAnalysis {
  sentiment: "bullish" | "bearish" | "neutral";
  confidence: number;
  signals: {
    bullish: string[];
    bearish: string[];
    neutral: string[];
  };
  recommendation: string;
  reasoning: string;
  targets?: {
    support: number[];
    resistance: number[];
  };
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

export const TIMEFRAMES = [
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1d' },
  { value: '1w', label: '1w' }
];

export const INDICATOR_CATEGORIES = {
  trend: {
    title: 'TREND',
    indicators: [
      'Moving Averages',
      'MACD',
      'Ichimoku Cloud',
      'ADX'
    ]
  },
  momentum: {
    title: 'MOMENTUM',
    indicators: [
      'RSI',
      'Stochastic RSI',
      'Momentum Oscillator'
    ]
  },
  volume: {
    title: 'VOLUME',
    indicators: [
      'Volume',
      'OBV'
    ]
  },
  volatility: {
    title: 'VOLATILITY',
    indicators: [
      'Bollinger Bands',
      'ATR'
    ]
  },
  onchain: {
    title: 'ON-CHAIN',
    indicators: [
      'Active Addresses',
      'MVRV Ratio'
    ]
  }
};

export const DEFAULT_COINS = ['BTC', 'ETH', 'SOL'];
