import { 
  users, coins, priceData, indicators, chatMessages, userPreferences, predictions, predictionResults, predictionMetrics,
  type User, type InsertUser, type Coin, type InsertCoin,
  type PriceData, type InsertPriceData, type Indicator, type InsertIndicator,
  type ChatMessage, type InsertChatMessage, type UserPreferences, type InsertUserPreferences,
  type Prediction, type InsertPrediction, type PredictionResult, type InsertPredictionResult,
  type PredictionMetrics, type InsertPredictionMetrics
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Coin methods
  getAllCoins(): Promise<Coin[]>;
  getCoin(id: number): Promise<Coin | undefined>;
  getCoinBySymbol(symbol: string): Promise<Coin | undefined>;
  createCoin(coin: InsertCoin): Promise<Coin>;
  updateCoin(id: number, updates: Partial<InsertCoin>): Promise<Coin | undefined>;
  
  // Price data methods
  getPriceData(coinId: number, timeframe: string, limit?: number): Promise<PriceData[]>;
  createPriceData(data: InsertPriceData): Promise<PriceData>;
  getLatestPrice(coinId: number): Promise<PriceData | undefined>;
  
  // Indicator methods
  getIndicators(coinId: number, timeframe: string, indicatorType?: string): Promise<Indicator[]>;
  createIndicator(indicator: InsertIndicator): Promise<Indicator>;
  getLatestIndicator(coinId: number, timeframe: string, indicatorType: string): Promise<Indicator | undefined>;
  
  // Chat methods
  getChatMessages(userId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // User preferences
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, updates: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;

  // Prediction methods
  getPredictions(coinId?: number, status?: string, limit?: number): Promise<Prediction[]>;
  getPrediction(id: number): Promise<Prediction | undefined>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  updatePrediction(id: number, updates: Partial<InsertPrediction>): Promise<Prediction | undefined>;
  getActivePredictions(): Promise<Prediction[]>;
  getExpiredPredictions(): Promise<Prediction[]>;

  // Prediction results
  getPredictionResults(predictionId?: number): Promise<PredictionResult[]>;
  createPredictionResult(result: InsertPredictionResult): Promise<PredictionResult>;

  // Prediction metrics
  getPredictionMetrics(coinId?: number, timeframe?: string): Promise<PredictionMetrics[]>;
  createPredictionMetrics(metrics: InsertPredictionMetrics): Promise<PredictionMetrics>;
  updatePredictionMetrics(id: number, updates: Partial<InsertPredictionMetrics>): Promise<PredictionMetrics | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private coins: Map<number, Coin> = new Map();
  private priceData: Map<number, PriceData> = new Map();
  private indicators: Map<number, Indicator> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private userPreferences: Map<number, UserPreferences> = new Map();
  private predictions: Map<number, Prediction> = new Map();
  private predictionResults: Map<number, PredictionResult> = new Map();
  private predictionMetrics: Map<number, PredictionMetrics> = new Map();
  
  private currentUserId = 1;
  private currentCoinId = 1;
  private currentPriceDataId = 1;
  private currentIndicatorId = 1;
  private currentChatMessageId = 1;
  private currentUserPreferencesId = 1;
  private currentPredictionId = 1;
  private currentPredictionResultId = 1;
  private currentPredictionMetricsId = 1;

  constructor() {
    // Initialize with default coins
    this.initializeDefaultCoins();
  }

  private initializeDefaultCoins() {
    const defaultCoins = [
      { symbol: "BTC", name: "Bitcoin", currentPrice: "43254.32", priceChange24h: "2.3", volume24h: "23.8", marketCap: "850000000000" },
      { symbol: "ETH", name: "Ethereum", currentPrice: "2643.89", priceChange24h: "-1.2", volume24h: "12.4", marketCap: "320000000000" },
      { symbol: "SOL", name: "Solana", currentPrice: "98.45", priceChange24h: "5.7", volume24h: "2.1", marketCap: "43000000000" },
    ];

    defaultCoins.forEach(coin => {
      const id = this.currentCoinId++;
      const coinData: Coin = {
        id,
        ...coin,
        lastUpdated: new Date()
      };
      this.coins.set(id, coinData);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllCoins(): Promise<Coin[]> {
    return Array.from(this.coins.values());
  }

  async getCoin(id: number): Promise<Coin | undefined> {
    return this.coins.get(id);
  }

  async getCoinBySymbol(symbol: string): Promise<Coin | undefined> {
    return Array.from(this.coins.values()).find(coin => coin.symbol === symbol);
  }

  async createCoin(insertCoin: InsertCoin): Promise<Coin> {
    const id = this.currentCoinId++;
    const coin: Coin = { ...insertCoin, id, lastUpdated: new Date() };
    this.coins.set(id, coin);
    return coin;
  }

  async updateCoin(id: number, updates: Partial<InsertCoin>): Promise<Coin | undefined> {
    const coin = this.coins.get(id);
    if (!coin) return undefined;
    
    const updatedCoin: Coin = { ...coin, ...updates, lastUpdated: new Date() };
    this.coins.set(id, updatedCoin);
    return updatedCoin;
  }

  async getPriceData(coinId: number, timeframe: string, limit = 100): Promise<PriceData[]> {
    return Array.from(this.priceData.values())
      .filter(data => data.coinId === coinId && data.timeframe === timeframe)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createPriceData(insertData: InsertPriceData): Promise<PriceData> {
    const id = this.currentPriceDataId++;
    const data: PriceData = { ...insertData, id };
    this.priceData.set(id, data);
    return data;
  }

  async getLatestPrice(coinId: number): Promise<PriceData | undefined> {
    return Array.from(this.priceData.values())
      .filter(data => data.coinId === coinId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }

  async getIndicators(coinId: number, timeframe: string, indicatorType?: string): Promise<Indicator[]> {
    return Array.from(this.indicators.values())
      .filter(indicator => 
        indicator.coinId === coinId && 
        indicator.timeframe === timeframe &&
        (!indicatorType || indicator.indicatorType === indicatorType)
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createIndicator(insertIndicator: InsertIndicator): Promise<Indicator> {
    const id = this.currentIndicatorId++;
    const indicator: Indicator = { ...insertIndicator, id };
    this.indicators.set(id, indicator);
    return indicator;
  }

  async getLatestIndicator(coinId: number, timeframe: string, indicatorType: string): Promise<Indicator | undefined> {
    return Array.from(this.indicators.values())
      .filter(indicator => 
        indicator.coinId === coinId && 
        indicator.timeframe === timeframe &&
        indicator.indicatorType === indicatorType
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }

  async getChatMessages(userId: number, limit = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const message: ChatMessage = { ...insertMessage, id, timestamp: new Date() };
    this.chatMessages.set(id, message);
    return message;
  }

  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(pref => pref.userId === userId);
  }

  async createUserPreferences(insertPreferences: InsertUserPreferences): Promise<UserPreferences> {
    const id = this.currentUserPreferencesId++;
    const preferences: UserPreferences = { ...insertPreferences, id };
    this.userPreferences.set(id, preferences);
    return preferences;
  }

  async updateUserPreferences(userId: number, updates: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const existing = Array.from(this.userPreferences.values()).find(pref => pref.userId === userId);
    if (!existing) return undefined;
    
    const updated: UserPreferences = { ...existing, ...updates };
    this.userPreferences.set(existing.id, updated);
    return updated;
  }

  // Prediction methods
  async getPredictions(coinId?: number, status?: string, limit = 50): Promise<Prediction[]> {
    return Array.from(this.predictions.values())
      .filter(prediction => 
        (!coinId || prediction.coinId === coinId) &&
        (!status || prediction.status === status)
      )
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async getPrediction(id: number): Promise<Prediction | undefined> {
    return this.predictions.get(id);
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = this.currentPredictionId++;
    const prediction: Prediction = {
      ...insertPrediction,
      id,
      status: "active",
      createdAt: new Date(),
      evaluatedAt: null
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  async updatePrediction(id: number, updates: Partial<InsertPrediction>): Promise<Prediction | undefined> {
    const prediction = this.predictions.get(id);
    if (!prediction) return undefined;
    
    const updated: Prediction = { ...prediction, ...updates };
    this.predictions.set(id, updated);
    return updated;
  }

  async getActivePredictions(): Promise<Prediction[]> {
    return Array.from(this.predictions.values())
      .filter(prediction => prediction.status === "active");
  }

  async getExpiredPredictions(): Promise<Prediction[]> {
    const now = new Date();
    return Array.from(this.predictions.values())
      .filter(prediction => 
        prediction.status === "active" && 
        new Date(prediction.expiresAt) <= now
      );
  }

  // Prediction results
  async getPredictionResults(predictionId?: number): Promise<PredictionResult[]> {
    return Array.from(this.predictionResults.values())
      .filter(result => !predictionId || result.predictionId === predictionId)
      .sort((a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime());
  }

  async createPredictionResult(insertResult: InsertPredictionResult): Promise<PredictionResult> {
    const id = this.currentPredictionResultId++;
    const result: PredictionResult = {
      ...insertResult,
      id,
      evaluatedAt: new Date()
    };
    this.predictionResults.set(id, result);
    return result;
  }

  // Prediction metrics
  async getPredictionMetrics(coinId?: number, timeframe?: string): Promise<PredictionMetrics[]> {
    return Array.from(this.predictionMetrics.values())
      .filter(metrics => 
        (!coinId || metrics.coinId === coinId) &&
        (!timeframe || metrics.timeframe === timeframe)
      );
  }

  async createPredictionMetrics(insertMetrics: InsertPredictionMetrics): Promise<PredictionMetrics> {
    const id = this.currentPredictionMetricsId++;
    const metrics: PredictionMetrics = {
      ...insertMetrics,
      id,
      lastUpdated: new Date()
    };
    this.predictionMetrics.set(id, metrics);
    return metrics;
  }

  async updatePredictionMetrics(id: number, updates: Partial<InsertPredictionMetrics>): Promise<PredictionMetrics | undefined> {
    const metrics = this.predictionMetrics.get(id);
    if (!metrics) return undefined;
    
    const updated: PredictionMetrics = { ...metrics, ...updates, lastUpdated: new Date() };
    this.predictionMetrics.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
