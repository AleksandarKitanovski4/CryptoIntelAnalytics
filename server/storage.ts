import { 
  users, coins, priceData, indicators, chatMessages, userPreferences,
  type User, type InsertUser, type Coin, type InsertCoin,
  type PriceData, type InsertPriceData, type Indicator, type InsertIndicator,
  type ChatMessage, type InsertChatMessage, type UserPreferences, type InsertUserPreferences
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private coins: Map<number, Coin> = new Map();
  private priceData: Map<number, PriceData> = new Map();
  private indicators: Map<number, Indicator> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private userPreferences: Map<number, UserPreferences> = new Map();
  
  private currentUserId = 1;
  private currentCoinId = 1;
  private currentPriceDataId = 1;
  private currentIndicatorId = 1;
  private currentChatMessageId = 1;
  private currentUserPreferencesId = 1;

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
}

export const storage = new MemStorage();
