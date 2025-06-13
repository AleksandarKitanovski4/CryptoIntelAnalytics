import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCoinAnalysis } from '../hooks/useMarketData';
import type { CoinData } from '../types/crypto';

interface MarketSummaryProps {
  selectedCoin: CoinData;
  selectedTimeframe: string;
}

export function MarketSummary({ selectedCoin, selectedTimeframe }: MarketSummaryProps) {
  const { analysis, isLoading } = useCoinAnalysis(selectedCoin.symbol, selectedTimeframe);

  if (isLoading) {
    return (
      <div className="bg-crypto-card rounded-xl border border-crypto-border p-6">
        <h4 className="font-semibold mb-4 text-white">Market Summary & Signals</h4>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-crypto-dark rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-crypto-dark rounded"></div>
                  <div className="h-3 bg-crypto-dark rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const defaultSignals = {
    bullish: ["MACD Bullish Crossover", "Volume Spike Detected", "Above MA(20)"],
    bearish: ["RSI Approaching Overbought", "High Funding Rates"],
    neutral: ["Sideways Price Action", "Low Volatility Period"]
  };

  const signals = analysis?.signals || defaultSignals;

  return (
    <div className="bg-crypto-card rounded-xl border border-crypto-border p-6">
      <h4 className="font-semibold mb-4 text-white">Market Summary & Signals</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bullish Signals */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-bullish flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            Bullish Signals
          </h5>
          <div className="space-y-2">
            {signals.bullish.slice(0, 3).map((signal, index) => (
              <div key={index} className="flex items-center space-x-2">
                <TrendingUp className="h-3 w-3 text-bullish flex-shrink-0" />
                <span className="text-sm text-white">{signal}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bearish Signals */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-bearish flex items-center">
            <TrendingDown className="h-4 w-4 mr-1" />
            Bearish Signals
          </h5>
          <div className="space-y-2">
            {signals.bearish.slice(0, 3).map((signal, index) => (
              <div key={index} className="flex items-center space-x-2">
                <TrendingDown className="h-3 w-3 text-bearish flex-shrink-0" />
                <span className="text-sm text-white">{signal}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Neutral Signals */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-neutral flex items-center">
            <Minus className="h-4 w-4 mr-1" />
            Neutral Signals
          </h5>
          <div className="space-y-2">
            {signals.neutral.slice(0, 3).map((signal, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Minus className="h-3 w-3 text-neutral flex-shrink-0" />
                <span className="text-sm text-white">{signal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Analysis Summary */}
      {analysis && (
        <div className="mt-6 p-4 bg-crypto-dark rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-white">AI Analysis:</span>
            <span className={`text-sm px-2 py-1 rounded text-xs font-medium ${
              analysis.sentiment === 'bullish' ? 'bg-bullish/20 text-bullish' :
              analysis.sentiment === 'bearish' ? 'bg-bearish/20 text-bearish' :
              'bg-neutral/20 text-neutral'
            }`}>
              {analysis.sentiment.toUpperCase()}
            </span>
            <span className="text-xs text-gray-400">({analysis.confidence}% confidence)</span>
          </div>
          <p className="text-sm text-gray-300">{analysis.recommendation}</p>
        </div>
      )}
    </div>
  );
}
