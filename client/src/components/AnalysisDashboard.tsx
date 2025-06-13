import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { CoinData, MarketAnalysis, TIMEFRAMES } from '../types/crypto';

interface AnalysisDashboardProps {
  selectedCoin?: CoinData;
  selectedTimeframe: string;
  onAnalyze: () => void;
  analysis?: MarketAnalysis;
  isLoading: boolean;
}

export function AnalysisDashboard({
  selectedCoin,
  selectedTimeframe,
  onAnalyze,
  analysis,
  isLoading
}: AnalysisDashboardProps) {
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-green-500';
      case 'bearish':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <ArrowUp className="w-5 h-5 text-green-500" />;
      case 'bearish':
        return <ArrowDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {selectedCoin ? `${selectedCoin.name} Analysis` : 'Select a Coin'}
          </h2>
          <p className="text-gray-400">
            {selectedTimeframe} Timeframe
          </p>
        </div>
        <Button
          onClick={onAnalyze}
          disabled={!selectedCoin || isLoading}
          className="bg-crypto-accent text-crypto-dark hover:bg-crypto-accent/90"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sentiment Card */}
          <Card className="p-6 bg-crypto-card border-crypto-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Market Sentiment</h3>
              {getSentimentIcon(analysis.sentiment)}
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Confidence</span>
                  <span className={getSentimentColor(analysis.sentiment)}>
                    {analysis.confidence}%
                  </span>
                </div>
                <Progress value={analysis.confidence} className="h-2" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">Key Signals</h4>
                <div className="space-y-1">
                  {analysis.signals.bullish.map((signal, i) => (
                    <p key={i} className="text-sm text-green-500">✓ {signal}</p>
                  ))}
                  {analysis.signals.bearish.map((signal, i) => (
                    <p key={i} className="text-sm text-red-500">✗ {signal}</p>
                  ))}
                  {analysis.signals.neutral.map((signal, i) => (
                    <p key={i} className="text-sm text-gray-400">• {signal}</p>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Recommendation Card */}
          <Card className="p-6 bg-crypto-card border-crypto-border">
            <h3 className="text-lg font-semibold text-white mb-4">Recommendation</h3>
            <div className="space-y-4">
              <p className="text-gray-300">{analysis.recommendation}</p>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">Reasoning</h4>
                <p className="text-sm text-gray-300">{analysis.reasoning}</p>
              </div>
              {analysis.targets && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Price Targets</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Support Levels</p>
                      <div className="space-y-1">
                        {analysis.targets.support.map((level, i) => (
                          <p key={i} className="text-sm text-green-500">${level.toLocaleString()}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Resistance Levels</p>
                      <div className="space-y-1">
                        {analysis.targets.resistance.map((level, i) => (
                          <p key={i} className="text-sm text-red-500">${level.toLocaleString()}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 