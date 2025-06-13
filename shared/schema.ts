import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const coins = pgTable("coins", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  currentPrice: decimal("current_price", { precision: 20, scale: 8 }),
  priceChange24h: decimal("price_change_24h", { precision: 10, scale: 4 }),
  volume24h: decimal("volume_24h", { precision: 20, scale: 2 }),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const priceData = pgTable("price_data", {
  id: serial("id").primaryKey(),
  coinId: integer("coin_id").references(() => coins.id),
  timeframe: text("timeframe").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  open: decimal("open", { precision: 20, scale: 8 }).notNull(),
  high: decimal("high", { precision: 20, scale: 8 }).notNull(),
  low: decimal("low", { precision: 20, scale: 8 }).notNull(),
  close: decimal("close", { precision: 20, scale: 8 }).notNull(),
  volume: decimal("volume", { precision: 20, scale: 2 }).notNull(),
});

export const indicators = pgTable("indicators", {
  id: serial("id").primaryKey(),
  coinId: integer("coin_id").references(() => coins.id),
  timeframe: text("timeframe").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  indicatorType: text("indicator_type").notNull(),
  values: jsonb("values").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  selectedCoins: jsonb("selected_coins").default([]),
  selectedTimeframe: text("selected_timeframe").default("1h"),
  selectedIndicators: jsonb("selected_indicators").default([]),
  theme: text("theme").default("dark"),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  coinId: integer("coin_id").references(() => coins.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  timeframe: text("timeframe").notNull(),
  prediction: text("prediction").notNull(), // 'BUY', 'SELL', 'WAIT'
  confidence: integer("confidence").notNull(), // 0-100
  priceAtPrediction: decimal("price_at_prediction", { precision: 20, scale: 8 }).notNull(),
  targetPrice: decimal("target_price", { precision: 20, scale: 8 }),
  stopLoss: decimal("stop_loss", { precision: 20, scale: 8 }),
  reasoning: text("reasoning").notNull(),
  indicatorsSnapshot: jsonb("indicators_snapshot").notNull(),
  sentimentData: jsonb("sentiment_data"),
  onchainData: jsonb("onchain_data"),
  derivativesData: jsonb("derivatives_data"),
  globalData: jsonb("global_data"),
  status: text("status").default("active"), // 'active', 'evaluated', 'expired'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  evaluatedAt: timestamp("evaluated_at"),
  expiresAt: timestamp("expires_at").notNull(),
});

export const predictionResults = pgTable("prediction_results", {
  id: serial("id").primaryKey(),
  predictionId: integer("prediction_id").references(() => predictions.id).notNull(),
  actualPrice: decimal("actual_price", { precision: 20, scale: 8 }).notNull(),
  priceChange: decimal("price_change", { precision: 10, scale: 4 }).notNull(),
  priceChangePercent: decimal("price_change_percent", { precision: 10, scale: 4 }).notNull(),
  outcome: text("outcome").notNull(), // 'correct', 'incorrect', 'partial'
  accuracy: integer("accuracy").notNull(), // 0-100
  profitLoss: decimal("profit_loss", { precision: 10, scale: 4 }),
  notes: text("notes"),
  evaluatedAt: timestamp("evaluated_at").defaultNow().notNull(),
});

export const predictionMetrics = pgTable("prediction_metrics", {
  id: serial("id").primaryKey(),
  coinId: integer("coin_id").references(() => coins.id),
  timeframe: text("timeframe"),
  totalPredictions: integer("total_predictions").default(0),
  correctPredictions: integer("correct_predictions").default(0),
  incorrectPredictions: integer("incorrect_predictions").default(0),
  partialPredictions: integer("partial_predictions").default(0),
  averageAccuracy: decimal("average_accuracy", { precision: 5, scale: 2 }).default("0"),
  averageConfidence: decimal("average_confidence", { precision: 5, scale: 2 }).default("0"),
  bestStreak: integer("best_streak").default(0),
  currentStreak: integer("current_streak").default(0),
  totalProfit: decimal("total_profit", { precision: 20, scale: 8 }).default("0"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertCoinSchema = createInsertSchema(coins).omit({
  id: true,
  lastUpdated: true,
});

export const insertPriceDataSchema = createInsertSchema(priceData).omit({
  id: true,
});

export const insertIndicatorSchema = createInsertSchema(indicators).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
  evaluatedAt: true,
  status: true,
});

export const insertPredictionResultSchema = createInsertSchema(predictionResults).omit({
  id: true,
  evaluatedAt: true,
});

export const insertPredictionMetricsSchema = createInsertSchema(predictionMetrics).omit({
  id: true,
  lastUpdated: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCoin = z.infer<typeof insertCoinSchema>;
export type Coin = typeof coins.$inferSelect;
export type InsertPriceData = z.infer<typeof insertPriceDataSchema>;
export type PriceData = typeof priceData.$inferSelect;
export type InsertIndicator = z.infer<typeof insertIndicatorSchema>;
export type Indicator = typeof indicators.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPredictionResult = z.infer<typeof insertPredictionResultSchema>;
export type PredictionResult = typeof predictionResults.$inferSelect;
export type InsertPredictionMetrics = z.infer<typeof insertPredictionMetricsSchema>;
export type PredictionMetrics = typeof predictionMetrics.$inferSelect;
