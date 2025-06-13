import pool from '../db';
import type { MarketAnalysis } from '../../shared/types/crypto';

export class AccuracyService {
  async storeAnalysisResult(
    coinSymbol: string,
    timeframe: string,
    analysis: MarketAnalysis,
    initialPrice: number
  ) {
    try {
      // TODO: Implement SQL INSERT using pool.query
      // Example:
      // await pool.query('INSERT INTO analysis_results (...) VALUES (...)', [...]);
    } catch (error) {
      console.error('Error storing analysis result:', error);
      throw new Error('Failed to store analysis result');
    }
  }

  async verifyPrediction(
    coinSymbol: string,
    timeframe: string,
    currentPrice: number
  ) {
    try {
      // Get the most recent unverified analysis
      const unverifiedAnalysis = await pool.query('SELECT * FROM analysis_results WHERE coin_symbol = $1 AND timeframe = $2 AND is_verified = false ORDER BY timestamp DESC LIMIT 1', [coinSymbol, timeframe]);

      if (unverifiedAnalysis.rows.length === 0) {
        return null;
      }

      // Calculate price change
      const priceChange = ((currentPrice - unverifiedAnalysis.rows[0].initial_price) / unverifiedAnalysis.rows[0].initial_price) * 100;

      // Determine if prediction was correct
      const predictionCorrect = this.isPredictionCorrect(
        unverifiedAnalysis.rows[0].sentiment,
        unverifiedAnalysis.rows[0].recommendation,
        priceChange
      );

      // Update the analysis result
      await pool.query('UPDATE analysis_results SET is_verified = true, verification_timestamp = $1, price_change = $2, prediction_correct = $3 WHERE id = $4', [new Date(), priceChange, predictionCorrect, unverifiedAnalysis.rows[0].id]);

      // Update accuracy statistics
      await this.updateAccuracyStats(coinSymbol, timeframe);

      return {
        predictionCorrect,
        priceChange,
        sentiment: unverifiedAnalysis.rows[0].sentiment,
        recommendation: unverifiedAnalysis.rows[0].recommendation
      };
    } catch (error) {
      console.error('Error verifying prediction:', error);
      throw new Error('Failed to verify prediction');
    }
  }

  private isPredictionCorrect(
    sentiment: string,
    recommendation: string,
    priceChange: number
  ): boolean {
    const significantChange = Math.abs(priceChange) >= 2; // 2% threshold for significant price movement

    if (!significantChange) {
      return recommendation.includes('WAIT');
    }

    if (sentiment === 'bullish' && recommendation.includes('BUY')) {
      return priceChange > 0;
    }

    if (sentiment === 'bearish' && recommendation.includes('SELL')) {
      return priceChange < 0;
    }

    return false;
  }

  async updateAccuracyStats(coinSymbol: string, timeframe: string) {
    try {
      // Get all verified predictions for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const verifiedPredictions = await pool.query('SELECT * FROM analysis_results WHERE coin_symbol = $1 AND timeframe = $2 AND is_verified = true AND verification_timestamp >= $3 AND verification_timestamp <= $4', [coinSymbol, timeframe, thirtyDaysAgo, new Date()]);

      // Calculate accuracy statistics
      const totalPredictions = verifiedPredictions.rows.length;
      const correctPredictions = verifiedPredictions.rows.filter(p => p.prediction_correct).length;
      const accuracy = Math.round((correctPredictions / totalPredictions) * 100);

      // Calculate sentiment-specific accuracy
      const bullishPredictions = verifiedPredictions.rows.filter(p => p.sentiment === 'bullish');
      const bearishPredictions = verifiedPredictions.rows.filter(p => p.sentiment === 'bearish');
      const neutralPredictions = verifiedPredictions.rows.filter(p => p.sentiment === 'neutral');

      const bullishAccuracy = this.calculateSentimentAccuracy(bullishPredictions);
      const bearishAccuracy = this.calculateSentimentAccuracy(bearishPredictions);
      const neutralAccuracy = this.calculateSentimentAccuracy(neutralPredictions);

      // Store accuracy statistics
      await pool.query('INSERT INTO analysis_accuracy (coin_symbol, timeframe, start_date, end_date, total_predictions, correct_predictions, accuracy, bullish_accuracy, bearish_accuracy, neutral_accuracy) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [coinSymbol, timeframe, thirtyDaysAgo, new Date(), totalPredictions, correctPredictions, accuracy, bullishAccuracy, bearishAccuracy, neutralAccuracy]);
    } catch (error) {
      console.error('Error updating accuracy stats:', error);
      throw new Error('Failed to update accuracy statistics');
    }
  }

  private calculateSentimentAccuracy(predictions: any[]): number {
    if (predictions.length === 0) return 0;
    const correct = predictions.filter(p => p.prediction_correct).length;
    return Math.round((correct / predictions.length) * 100);
  }

  async getAccuracyStats(
    coinSymbol: string,
    timeframe: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      const stats = await pool.query('SELECT * FROM analysis_accuracy WHERE coin_symbol = $1 AND timeframe = $2 AND start_date >= $3 AND end_date <= $4 ORDER BY end_date DESC', [coinSymbol, timeframe, startDate, endDate]);

      return stats.rows;
    } catch (error) {
      console.error('Error getting accuracy stats:', error);
      throw new Error('Failed to get accuracy statistics');
    }
  }
} 