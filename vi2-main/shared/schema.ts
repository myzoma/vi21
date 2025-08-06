import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const watchlistItems = pgTable("watchlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  symbol: text("symbol").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  symbol: text("symbol").notNull(),
  condition: text("condition").notNull(), // 'above' or 'below'
  targetPrice: real("target_price").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  interval: text("interval").notNull(),
  elliottWaveData: jsonb("elliott_wave_data"),
  technicalIndicators: jsonb("technical_indicators"),
  tradingSignals: jsonb("trading_signals"),
  confidence: real("confidence"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWatchlistItemSchema = createInsertSchema(watchlistItems).pick({
  symbol: true,
  userId: true,
});

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).pick({
  symbol: true,
  condition: true,
  targetPrice: true,
  userId: true,
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).pick({
  symbol: true,
  interval: true,
  elliottWaveData: true,
  technicalIndicators: true,
  tradingSignals: true,
  confidence: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWatchlistItem = z.infer<typeof insertWatchlistItemSchema>;
export type WatchlistItem = typeof watchlistItems.$inferSelect;

export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;

export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;

// Trading data types
export const MarketDataSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  change24h: z.number(),
  volume24h: z.number(),
  marketCap: z.number().optional(),
  timestamp: z.number(),
});

export const TechnicalIndicatorSchema = z.object({
  rsi: z.number(),
  macd: z.object({
    macd: z.number(),
    signal: z.number(),
    histogram: z.number(),
  }),
  bollingerBands: z.object({
    upper: z.number(),
    middle: z.number(),
    lower: z.number(),
  }),
  adx: z.number(),
  movingAverages: z.object({
    ma20: z.number(),
    ma50: z.number(),
    ma200: z.number(),
  }),
});

export const ElliottWaveSchema = z.object({
  currentWave: z.number(),
  wavePattern: z.string(),
  confidence: z.number(),
  fibonacciLevels: z.object({
    support618: z.number(),
    support382: z.number(),
    resistance1272: z.number(),
    resistance1618: z.number(),
  }),
  targets: z.array(z.number()),
  waveStructure: z.array(z.object({
    wave: z.number(),
    startPrice: z.number(),
    endPrice: z.number(),
    status: z.string(),
  })),
});

export const TradingSignalSchema = z.object({
  signal: z.enum(['BUY', 'SELL', 'HOLD']),
  strength: z.enum(['WEAK', 'MEDIUM', 'STRONG']),
  confidence: z.number(),
  entryPrice: z.number(),
  stopLoss: z.number(),
  takeProfit: z.number(),
  description: z.string(),
  supportingFactors: z.array(z.string()),
});

export type MarketData = z.infer<typeof MarketDataSchema>;
export type TechnicalIndicator = z.infer<typeof TechnicalIndicatorSchema>;
export type ElliottWave = z.infer<typeof ElliottWaveSchema>;
export type TradingSignal = z.infer<typeof TradingSignalSchema>;
