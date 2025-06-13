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
