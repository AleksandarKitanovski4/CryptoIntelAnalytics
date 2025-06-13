import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cryptoDataService } from "./services/cryptoData";
import { aiAnalysisService } from "./services/aiAnalysis";
import { CryptoWebSocketServer } from "./utils/websocket";
import { insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize WebSocket server
  new CryptoWebSocketServer(httpServer);

  // Get all coins
  app.get("/api/coins", async (req, res) => {
    try {
      const coins = await storage.getAllCoins();
      res.json(coins);
    } catch (error) {
      console.error("Error fetching coins:", error);
      res.status(500).json({ error: "Failed to fetch coins" });
    }
  });

  // Get coin by symbol
  app.get("/api/coins/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const coin = await storage.getCoinBySymbol(symbol.toUpperCase());
      
      if (!coin) {
        return res.status(404).json({ error: "Coin not found" });
      }
      
      res.json(coin);
    } catch (error) {
      console.error("Error fetching coin:", error);
      res.status(500).json({ error: "Failed to fetch coin" });
    }
  });

  // Get historical price data
  app.get("/api/coins/:symbol/history", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { timeframe = '1h', limit = '100' } = req.query;
      
      const coin = await storage.getCoinBySymbol(symbol.toUpperCase());
      if (!coin) {
        return res.status(404).json({ error: "Coin not found" });
      }

      const priceData = await storage.getPriceData(
        coin.id, 
        timeframe as string, 
        parseInt(limit as string)
      );
      
      res.json(priceData);
    } catch (error) {
      console.error("Error fetching price history:", error);
      res.status(500).json({ error: "Failed to fetch price history" });
    }
  });

  // Get indicators for a coin
  app.get("/api/coins/:symbol/indicators", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { timeframe = '1h', type } = req.query;
      
      const coin = await storage.getCoinBySymbol(symbol.toUpperCase());
      if (!coin) {
        return res.status(404).json({ error: "Coin not found" });
      }

      const indicators = await storage.getIndicators(
        coin.id, 
        timeframe as string, 
        type as string
      );
      
      res.json(indicators);
    } catch (error) {
      console.error("Error fetching indicators:", error);
      res.status(500).json({ error: "Failed to fetch indicators" });
    }
  });

  // Get market analysis
  app.get("/api/analysis/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const { timeframe = '1h' } = req.query;
      
      const analysis = await aiAnalysisService.analyzeMarket(
        symbol.toUpperCase(), 
        timeframe as string
      );
      
      res.json(analysis);
    } catch (error) {
      console.error("Error generating analysis:", error);
      res.status(500).json({ error: "Failed to generate market analysis" });
    }
  });

  // Chat with AI assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const { message, userId } = validatedData;
      const { coinSymbol, timeframe } = req.body;
      
      // Get AI response
      const response = await aiAnalysisService.chatWithAssistant(
        message, 
        coinSymbol, 
        timeframe
      );
      
      // Store chat message
      const chatMessage = await storage.createChatMessage({
        userId: userId || 1, // Default user for demo
        message,
        response
      });
      
      res.json({ 
        message: chatMessage.message,
        response: chatMessage.response,
        timestamp: chatMessage.timestamp
      });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Get chat history
  app.get("/api/chat/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = '50' } = req.query;
      
      const messages = await storage.getChatMessages(
        parseInt(userId), 
        parseInt(limit as string)
      );
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Get Fear & Greed Index
  app.get("/api/market/fear-greed", async (req, res) => {
    try {
      const fearGreedIndex = await cryptoDataService.getFearGreedIndex();
      res.json({ value: fearGreedIndex });
    } catch (error) {
      console.error("Error fetching Fear & Greed index:", error);
      res.status(500).json({ error: "Failed to fetch Fear & Greed index" });
    }
  });

  // Update coin prices manually
  app.post("/api/update/prices", async (req, res) => {
    try {
      await cryptoDataService.updateCoinPrices();
      res.json({ message: "Prices updated successfully" });
    } catch (error) {
      console.error("Error updating prices:", error);
      res.status(500).json({ error: "Failed to update prices" });
    }
  });

  // Get user preferences
  app.get("/api/preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const preferences = await storage.getUserPreferences(parseInt(userId));
      
      if (!preferences) {
        // Create default preferences
        const defaultPrefs = await storage.createUserPreferences({
          userId: parseInt(userId),
          selectedCoins: ["BTC", "ETH", "SOL"],
          selectedTimeframe: "1h",
          selectedIndicators: ["RSI", "MACD", "Moving Averages", "Bollinger Bands", "Volume"],
          theme: "dark"
        });
        return res.json(defaultPrefs);
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ error: "Failed to fetch user preferences" });
    }
  });

  // Update user preferences
  app.put("/api/preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      const preferences = await storage.updateUserPreferences(
        parseInt(userId), 
        updates
      );
      
      if (!preferences) {
        return res.status(404).json({ error: "User preferences not found" });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ error: "Failed to update user preferences" });
    }
  });

  return httpServer;
}
