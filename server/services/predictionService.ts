import { storage } from "../storage";
import { aiAnalysisService } from "./aiAnalysis";
import { cryptoDataService } from "./cryptoData";
import { TechnicalIndicators } from "./indicators";
import type { Coin, Prediction, InsertPrediction } from "@shared/schema";

export type PredictionDecision = "BUY" | "SELL" | "WAIT";

export interface PredictionAnalysis {
  decision: PredictionDecision;
  confidence: number;
  reasoning: string;
  targetPrice?: number;
  stopLoss?: number;
  technicalSignals: {
    bullish: string[];
    bearish: string[];
    neutral: string[];
  };
  sentimentScore: number;
  onchainSignals: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export interface PredictionEvaluation {
  outcome: "correct" | "incorrect" | "partial";
  accuracy: number;
  priceChange: number;
  priceChangePercent: number;
  profitLoss?: number;
}

export class PredictionService {
  
  async createPrediction(
    coinSymbol: string, 
    timeframe: string, 
    userId?: number
  ): Promise<Prediction> {
    const coin = await storage.getCoinBySymbol(coinSymbol);
    if (!coin) {
      throw new Error(`Coin ${coinSymbol} not found`);
    }

    const currentPrice = parseFloat(coin.currentPrice || "0");
    if (currentPrice === 0) {
      throw new Error(`Invalid price data for ${coinSymbol}`);
    }

    // Gather comprehensive analysis data
    const analysis = await this.generatePredictionAnalysis(coin, timeframe);
    
    // Calculate expiration time based on timeframe
    const expiresAt = this.calculateExpirationTime(timeframe);
    
    // Create prediction record
    const prediction = await storage.createPrediction({
      coinId: coin.id,
      userId: userId || null,
      timeframe,
      prediction: analysis.decision,
      confidence: analysis.confidence,
      priceAtPrediction: currentPrice.toString(),
      targetPrice: analysis.targetPrice?.toString() || null,
      stopLoss: analysis.stopLoss?.toString() || null,
      reasoning: analysis.reasoning,
      indicatorsSnapshot: await this.getIndicatorsSnapshot(coin.id, timeframe),
      sentimentData: { score: analysis.sentimentScore },
      onchainData: { signals: analysis.onchainSignals },
      derivativesData: null,
      globalData: null,
      expiresAt
    });

    return prediction;
  }

  async generatePredictionAnalysis(coin: Coin, timeframe: string): Promise<PredictionAnalysis> {
    const currentPrice = parseFloat(coin.currentPrice || "0");
    const priceChange24h = parseFloat(coin.priceChange24h || "0");

    // Get technical indicators
    const indicators = await storage.getIndicators(coin.id, timeframe);
    const technicalSignals = this.analyzeTechnicalSignals(indicators, currentPrice, priceChange24h);

    // Get market sentiment
    const fearGreedIndex = await cryptoDataService.getFearGreedIndex();
    const sentimentScore = this.calculateSentimentScore(fearGreedIndex, priceChange24h);

    // Generate on-chain signals (simulated for demo)
    const onchainSignals = this.generateOnchainSignals(coin.symbol);

    // Calculate overall decision
    const decision = this.calculateDecision(technicalSignals, sentimentScore, onchainSignals);
    const confidence = this.calculateConfidence(technicalSignals, sentimentScore);
    const riskLevel = this.assessRiskLevel(confidence, technicalSignals);

    // Calculate price targets
    const { targetPrice, stopLoss } = this.calculatePriceTargets(
      currentPrice, 
      decision, 
      technicalSignals
    );

    const reasoning = this.generateReasoning(
      decision, 
      technicalSignals, 
      sentimentScore, 
      onchainSignals,
      coin.symbol,
      timeframe
    );

    return {
      decision,
      confidence,
      reasoning,
      targetPrice,
      stopLoss,
      technicalSignals,
      sentimentScore,
      onchainSignals,
      riskLevel
    };
  }

  private analyzeTechnicalSignals(indicators: any[], currentPrice: number, priceChange24h: number) {
    const bullish: string[] = [];
    const bearish: string[] = [];
    const neutral: string[] = [];

    // RSI Analysis
    const rsiValue = 45 + Math.random() * 30; // Simulated RSI
    if (rsiValue < 30) {
      bullish.push("RSI Oversold (potential reversal)");
    } else if (rsiValue > 70) {
      bearish.push("RSI Overbought (potential correction)");
    } else {
      neutral.push("RSI in neutral range");
    }

    // Price momentum
    if (priceChange24h > 5) {
      bullish.push("Strong upward momentum (+5%+)");
    } else if (priceChange24h < -5) {
      bearish.push("Strong downward momentum (-5%+)");
    } else {
      neutral.push("Sideways price action");
    }

    // Moving averages (simulated)
    const ma20 = currentPrice * (0.98 + Math.random() * 0.04);
    const ma50 = currentPrice * (0.95 + Math.random() * 0.1);
    
    if (currentPrice > ma20 && currentPrice > ma50) {
      bullish.push("Price above key moving averages");
    } else if (currentPrice < ma20 && currentPrice < ma50) {
      bearish.push("Price below key moving averages");
    } else {
      neutral.push("Mixed moving average signals");
    }

    // Volume analysis (simulated)
    const volumeStrength = Math.random();
    if (volumeStrength > 0.7) {
      if (priceChange24h > 0) {
        bullish.push("High volume supporting price increase");
      } else {
        bearish.push("High volume on price decline");
      }
    } else {
      neutral.push("Average trading volume");
    }

    return { bullish, bearish, neutral };
  }

  private calculateSentimentScore(fearGreedIndex: number, priceChange24h: number): number {
    // Combine fear & greed with recent price action
    const sentimentBase = fearGreedIndex;
    const momentumAdjustment = Math.max(-20, Math.min(20, priceChange24h * 2));
    return Math.max(0, Math.min(100, sentimentBase + momentumAdjustment));
  }

  private generateOnchainSignals(symbol: string): string[] {
    const signals: string[] = [];
    
    // Simulated on-chain analysis
    const whaleActivity = Math.random();
    const exchangeFlows = Math.random();
    const activeAddresses = Math.random();

    if (whaleActivity > 0.7) {
      signals.push("Increased whale accumulation detected");
    } else if (whaleActivity < 0.3) {
      signals.push("Whale distribution activity");
    }

    if (exchangeFlows < 0.4) {
      signals.push("Net outflows from exchanges (bullish)");
    } else if (exchangeFlows > 0.7) {
      signals.push("Net inflows to exchanges (bearish)");
    }

    if (activeAddresses > 0.6) {
      signals.push("Rising network activity");
    }

    return signals;
  }

  private calculateDecision(
    technicalSignals: any, 
    sentimentScore: number, 
    onchainSignals: string[]
  ): PredictionDecision {
    let bullishScore = 0;
    let bearishScore = 0;

    // Technical signals weight
    bullishScore += technicalSignals.bullish.length * 2;
    bearishScore += technicalSignals.bearish.length * 2;

    // Sentiment weight
    if (sentimentScore > 60) bullishScore += 1;
    if (sentimentScore < 40) bearishScore += 1;

    // On-chain signals weight
    onchainSignals.forEach(signal => {
      if (signal.includes("accumulation") || signal.includes("outflows") || signal.includes("Rising")) {
        bullishScore += 1;
      } else if (signal.includes("distribution") || signal.includes("inflows")) {
        bearishScore += 1;
      }
    });

    const scoreDiff = bullishScore - bearishScore;
    
    if (scoreDiff >= 2) return "BUY";
    if (scoreDiff <= -2) return "SELL";
    return "WAIT";
  }

  private calculateConfidence(technicalSignals: any, sentimentScore: number): number {
    const signalStrength = technicalSignals.bullish.length + technicalSignals.bearish.length;
    const sentimentClarity = Math.abs(sentimentScore - 50) / 50; // 0-1 range
    
    const baseConfidence = 50;
    const signalBonus = Math.min(30, signalStrength * 8);
    const sentimentBonus = sentimentClarity * 20;
    
    return Math.round(baseConfidence + signalBonus + sentimentBonus);
  }

  private assessRiskLevel(confidence: number, technicalSignals: any): "LOW" | "MEDIUM" | "HIGH" {
    const conflictingSignals = technicalSignals.bullish.length > 0 && technicalSignals.bearish.length > 0;
    
    if (confidence > 80 && !conflictingSignals) return "LOW";
    if (confidence < 60 || conflictingSignals) return "HIGH";
    return "MEDIUM";
  }

  private calculatePriceTargets(
    currentPrice: number, 
    decision: PredictionDecision, 
    technicalSignals: any
  ) {
    if (decision === "WAIT") {
      return { targetPrice: undefined, stopLoss: undefined };
    }

    const volatilityFactor = 0.05 + Math.random() * 0.05; // 5-10% moves
    
    if (decision === "BUY") {
      const targetPrice = currentPrice * (1 + volatilityFactor);
      const stopLoss = currentPrice * (1 - volatilityFactor * 0.6);
      return { targetPrice, stopLoss };
    } else {
      const targetPrice = currentPrice * (1 - volatilityFactor);
      const stopLoss = currentPrice * (1 + volatilityFactor * 0.6);
      return { targetPrice, stopLoss };
    }
  }

  private generateReasoning(
    decision: PredictionDecision,
    technicalSignals: any,
    sentimentScore: number,
    onchainSignals: string[],
    symbol: string,
    timeframe: string
  ): string {
    const reasons: string[] = [];

    reasons.push(`${symbol} ${timeframe} Analysis:`);
    
    if (decision === "BUY") {
      reasons.push("🟢 BULLISH SIGNALS DETECTED");
      if (technicalSignals.bullish.length > 0) {
        reasons.push(`Technical: ${technicalSignals.bullish.slice(0, 2).join(", ")}`);
      }
    } else if (decision === "SELL") {
      reasons.push("🔴 BEARISH SIGNALS DETECTED");
      if (technicalSignals.bearish.length > 0) {
        reasons.push(`Technical: ${technicalSignals.bearish.slice(0, 2).join(", ")}`);
      }
    } else {
      reasons.push("⚪ MIXED SIGNALS - WAIT FOR CLARITY");
    }

    if (sentimentScore > 60) {
      reasons.push(`Market sentiment: Positive (${sentimentScore}/100)`);
    } else if (sentimentScore < 40) {
      reasons.push(`Market sentiment: Negative (${sentimentScore}/100)`);
    }

    if (onchainSignals.length > 0) {
      reasons.push(`On-chain: ${onchainSignals[0]}`);
    }

    reasons.push("⚠️ For educational purposes only. Always do your own research.");

    return reasons.join("\n");
  }

  private calculateExpirationTime(timeframe: string): Date {
    const now = new Date();
    const multipliers: Record<string, number> = {
      '5m': 5,
      '15m': 15,
      '1h': 60,
      '4h': 240,
      '1d': 1440,
      '1w': 10080
    };

    const minutes = multipliers[timeframe] || 60;
    return new Date(now.getTime() + minutes * 60 * 1000);
  }

  private async getIndicatorsSnapshot(coinId: number, timeframe: string) {
    const indicators = await storage.getIndicators(coinId, timeframe);
    return {
      rsi: 45 + Math.random() * 30,
      macd: (Math.random() - 0.5) * 200,
      volume: Math.random() * 1000000,
      timestamp: new Date().toISOString()
    };
  }

  async evaluatePredictions(): Promise<void> {
    const expiredPredictions = await storage.getExpiredPredictions();
    
    for (const prediction of expiredPredictions) {
      try {
        await this.evaluateSinglePrediction(prediction);
      } catch (error) {
        console.error(`Error evaluating prediction ${prediction.id}:`, error);
      }
    }
  }

  private async evaluateSinglePrediction(prediction: Prediction): Promise<void> {
    const coin = await storage.getCoin(prediction.coinId);
    if (!coin) return;

    const currentPrice = parseFloat(coin.currentPrice || "0");
    const originalPrice = parseFloat(prediction.priceAtPrediction);
    
    const priceChange = currentPrice - originalPrice;
    const priceChangePercent = (priceChange / originalPrice) * 100;

    const evaluation = this.calculatePredictionAccuracy(
      prediction.prediction as PredictionDecision,
      priceChangePercent,
      prediction.confidence
    );

    // Store prediction result
    await storage.createPredictionResult({
      predictionId: prediction.id,
      actualPrice: currentPrice.toString(),
      priceChange: priceChange.toString(),
      priceChangePercent: priceChangePercent.toString(),
      outcome: evaluation.outcome,
      accuracy: evaluation.accuracy,
      profitLoss: evaluation.profitLoss?.toString() || null,
      notes: `Predicted: ${prediction.prediction}, Price change: ${priceChangePercent.toFixed(2)}%`
    });

    // Update prediction status
    await storage.updatePrediction(prediction.id, { status: "evaluated" });

    // Update metrics
    await this.updatePredictionMetrics(prediction, evaluation);
  }

  private calculatePredictionAccuracy(
    prediction: PredictionDecision,
    priceChangePercent: number,
    confidence: number
  ): PredictionEvaluation {
    let outcome: "correct" | "incorrect" | "partial" = "incorrect";
    let accuracy = 0;

    const threshold = 2; // 2% threshold for significant moves

    if (prediction === "BUY" && priceChangePercent > threshold) {
      outcome = "correct";
      accuracy = Math.min(100, 70 + priceChangePercent * 2);
    } else if (prediction === "SELL" && priceChangePercent < -threshold) {
      outcome = "correct";
      accuracy = Math.min(100, 70 + Math.abs(priceChangePercent) * 2);
    } else if (prediction === "WAIT" && Math.abs(priceChangePercent) <= threshold) {
      outcome = "correct";
      accuracy = 80;
    } else if (Math.abs(priceChangePercent) <= threshold * 2) {
      outcome = "partial";
      accuracy = 40;
    }

    const profitLoss = prediction === "BUY" ? priceChangePercent : 
                      prediction === "SELL" ? -priceChangePercent : 0;

    return {
      outcome,
      accuracy,
      priceChange: priceChangePercent,
      priceChangePercent,
      profitLoss
    };
  }

  private async updatePredictionMetrics(
    prediction: Prediction, 
    evaluation: PredictionEvaluation
  ): Promise<void> {
    const existingMetrics = await storage.getPredictionMetrics(
      prediction.coinId, 
      prediction.timeframe
    );

    let metrics = existingMetrics[0];
    
    if (!metrics) {
      metrics = await storage.createPredictionMetrics({
        coinId: prediction.coinId,
        timeframe: prediction.timeframe,
        totalPredictions: 0,
        correctPredictions: 0,
        incorrectPredictions: 0,
        partialPredictions: 0,
        averageAccuracy: "0",
        averageConfidence: "0",
        bestStreak: 0,
        currentStreak: 0,
        totalProfit: "0"
      });
    }

    // Update metrics
    const updates = {
      totalPredictions: (metrics.totalPredictions || 0) + 1,
      correctPredictions: metrics.correctPredictions || 0,
      incorrectPredictions: metrics.incorrectPredictions || 0,
      partialPredictions: metrics.partialPredictions || 0,
      currentStreak: metrics.currentStreak || 0,
      bestStreak: metrics.bestStreak || 0
    };

    if (evaluation.outcome === "correct") {
      updates.correctPredictions++;
      updates.currentStreak++;
      updates.bestStreak = Math.max(updates.bestStreak, updates.currentStreak);
    } else if (evaluation.outcome === "incorrect") {
      updates.incorrectPredictions++;
      updates.currentStreak = 0;
    } else {
      updates.partialPredictions++;
    }

    const totalAccuracy = (updates.correctPredictions * 100 + updates.partialPredictions * 40) / updates.totalPredictions;
    
    await storage.updatePredictionMetrics(metrics.id, {
      ...updates,
      averageAccuracy: totalAccuracy.toFixed(2)
    });
  }

  async getPredictionHistory(coinId?: number, limit = 20) {
    const predictions = await storage.getPredictions(coinId, undefined, limit);
    const results = await Promise.all(
      predictions.map(async (prediction) => {
        const results = await storage.getPredictionResults(prediction.id);
        return {
          ...prediction,
          result: results[0] || null
        };
      })
    );
    return results;
  }

  async getPredictionAccuracy(coinId?: number, timeframe?: string) {
    const metrics = await storage.getPredictionMetrics(coinId, timeframe);
    if (metrics.length === 0) {
      return {
        totalPredictions: 0,
        accuracy: 0,
        correctPredictions: 0,
        incorrectPredictions: 0
      };
    }

    const totalMetrics = metrics.reduce((acc, metric) => ({
      totalPredictions: acc.totalPredictions + (metric.totalPredictions || 0),
      correctPredictions: acc.correctPredictions + (metric.correctPredictions || 0),
      incorrectPredictions: acc.incorrectPredictions + (metric.incorrectPredictions || 0),
      partialPredictions: acc.partialPredictions + (metric.partialPredictions || 0)
    }), { totalPredictions: 0, correctPredictions: 0, incorrectPredictions: 0, partialPredictions: 0 });

    const accuracy = totalMetrics.totalPredictions > 0 
      ? ((totalMetrics.correctPredictions + totalMetrics.partialPredictions * 0.4) / totalMetrics.totalPredictions) * 100
      : 0;

    return {
      ...totalMetrics,
      accuracy: Math.round(accuracy)
    };
  }
}

export const predictionService = new PredictionService();