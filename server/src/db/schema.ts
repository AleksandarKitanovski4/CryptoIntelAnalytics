// This file is no longer needed. Drizzle ORM schema removed.

// Drizzle ORM schema removed. If you need to define your schema, do it in SQL or with migrations for PostgreSQL.
// This file is no longer needed if you are not using Drizzle ORM.

import { pgTable, serial, varchar, timestamp, integer, jsonb, boolean } from 'drizzle-orm/pg-core';

// Analysis results table
export const analysisResults = pgTable('analysis_results', {
  id: serial('id').primaryKey(),
  coinSymbol: varchar('coin_symbol', { length: 10 }).notNull(),
  timeframe: varchar('timeframe', { length: 10 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  sentiment: varchar('sentiment', { length: 10 }).notNull(),
  confidence: integer('confidence').notNull(),
  signals: jsonb('signals').notNull(),
  recommendation: varchar('recommendation', { length: 255 }).notNull(),
  reasoning: varchar('reasoning', { length: 1000 }).notNull(),
  priceTargets: jsonb('price_targets'),
  initialPrice: integer('initial_price').notNull(),
  isVerified: boolean('is_verified').default(false),
  verificationTimestamp: timestamp('verification_timestamp'),
  priceChange: integer('price_change'),
  predictionCorrect: boolean('prediction_correct')
});

// Analysis accuracy table
export const analysisAccuracy = pgTable('analysis_accuracy', {
  id: serial('id').primaryKey(),
  coinSymbol: varchar('coin_symbol', { length: 10 }).notNull(),
  timeframe: varchar('timeframe', { length: 10 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  totalPredictions: integer('total_predictions').notNull(),
  correctPredictions: integer('correct_predictions').notNull(),
  accuracy: integer('accuracy').notNull(),
  bullishAccuracy: integer('bullish_accuracy'),
  bearishAccuracy: integer('bearish_accuracy'),
  neutralAccuracy: integer('neutral_accuracy')
});

// Create indexes
export const analysisResultsIndexes = {
  coinTimeframeIdx: 'idx_analysis_results_coin_timeframe',
  timestampIdx: 'idx_analysis_results_timestamp',
  isVerifiedIdx: 'idx_analysis_results_is_verified'
};

export const analysisAccuracyIndexes = {
  coinTimeframeIdx: 'idx_analysis_accuracy_coin_timeframe',
  dateRangeIdx: 'idx_analysis_accuracy_date_range'
}; 