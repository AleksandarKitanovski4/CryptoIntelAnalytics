import OpenAI from "openai";
import { storage } from "../storage";
import type { Coin, Indicator } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || ""
});

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

export class AIAnalysisService {
  async analyzeMarket(coinSymbol: string, timeframe: string): Promise<MarketAnalysis> {
    try {
      const coin = await storage.getCoinBySymbol(coinSymbol);
      if (!coin) {
        throw new Error(`Coin ${coinSymbol} not found`);
      }

      const indicators = await storage.getIndicators(coin.id, timeframe);
      const currentPrice = parseFloat(coin.currentPrice || "0");
      
      const analysisPrompt = this.buildAnalysisPrompt(coin, indicators, timeframe);
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional cryptocurrency market analyst. Analyze the provided technical indicators and market data to provide insights. Respond with JSON in the exact format specified."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        sentiment: analysis.sentiment || "neutral",
        confidence: Math.min(100, Math.max(0, analysis.confidence || 50)),
        signals: {
          bullish: analysis.signals?.bullish || [],
          bearish: analysis.signals?.bearish || [],
          neutral: analysis.signals?.neutral || []
        },
        recommendation: analysis.recommendation || "Hold and monitor market conditions",
        reasoning: analysis.reasoning || "Insufficient data for comprehensive analysis",
        targets: analysis.targets
      };
    } catch (error) {
      console.error('AI Analysis error:', error);
      return this.getFallbackAnalysis(coinSymbol);
    }
  }

  async chatWithAssistant(userMessage: string, coinSymbol?: string, timeframe?: string): Promise<string> {
    try {
      let context = "";
      
      if (coinSymbol) {
        const coin = await storage.getCoinBySymbol(coinSymbol);
        if (coin && timeframe) {
          const indicators = await storage.getIndicators(coin.id, timeframe);
          context = this.buildContextFromIndicators(coin, indicators, timeframe);
        }
      }

      const chatPrompt = `
        Context: ${context}
        
        User Question: ${userMessage}
        
        Please provide a helpful response about cryptocurrency analysis, technical indicators, or market insights. 
        Be specific and actionable when possible.
      `;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable cryptocurrency trading analyst. Provide clear, concise, and helpful responses about technical analysis, market trends, and trading strategies. Always emphasize that your analysis is for educational purposes only and not financial advice."
          },
          {
            role: "user",
            content: chatPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a response at the moment. Please try again.";
    } catch (error) {
      console.error('Chat AI error:', error);
      return "I'm experiencing some technical difficulties. Please try asking your question again, or rephrase it for better results.";
    }
  }

  private buildAnalysisPrompt(coin: Coin, indicators: Indicator[], timeframe: string): string {
    const indicatorData = this.extractIndicatorValues(indicators);
    const currentPrice = parseFloat(coin.currentPrice || "0");
    const priceChange = parseFloat(coin.priceChange24h || "0");

    return `
      Analyze the following cryptocurrency data for ${coin.name} (${coin.symbol}) on ${timeframe} timeframe:

      Current Price: $${currentPrice}
      24h Change: ${priceChange}%
      
      Technical Indicators:
      ${indicatorData}
      
      Please provide analysis in the following JSON format:
      {
        "sentiment": "bullish|bearish|neutral",
        "confidence": 0-100,
        "signals": {
          "bullish": ["signal1", "signal2"],
          "bearish": ["signal1", "signal2"],
          "neutral": ["signal1", "signal2"]
        },
        "recommendation": "detailed recommendation",
        "reasoning": "detailed reasoning for the analysis",
        "targets": {
          "support": [price1, price2],
          "resistance": [price1, price2]
        }
      }
    `;
  }

  private buildContextFromIndicators(coin: Coin, indicators: Indicator[], timeframe: string): string {
    const indicatorData = this.extractIndicatorValues(indicators);
    const currentPrice = parseFloat(coin.currentPrice || "0");
    const priceChange = parseFloat(coin.priceChange24h || "0");

    return `
      Current analysis for ${coin.name} (${coin.symbol}) on ${timeframe}:
      Price: $${currentPrice} (${priceChange > 0 ? '+' : ''}${priceChange}%)
      
      Technical Indicators:
      ${indicatorData}
    `;
  }

  private extractIndicatorValues(indicators: Indicator[]): string {
    let indicatorText = "";
    
    for (const indicator of indicators.slice(0, 10)) { // Limit to recent indicators
      indicatorText += `${indicator.indicatorType}: ${JSON.stringify(indicator.values)}\n`;
    }
    
    return indicatorText || "No recent indicator data available";
  }

  private getFallbackAnalysis(coinSymbol: string): MarketAnalysis {
    return {
      sentiment: "neutral",
      confidence: 50,
      signals: {
        bullish: ["Market conditions require further analysis"],
        bearish: ["Limited data available for comprehensive analysis"],
        neutral: ["Waiting for clearer market signals"]
      },
      recommendation: "Monitor market conditions and wait for clearer signals before making trading decisions",
      reasoning: "Unable to perform comprehensive analysis due to limited data or service availability",
      targets: {
        support: [],
        resistance: []
      }
    };
  }
}

export const aiAnalysisService = new AIAnalysisService();
