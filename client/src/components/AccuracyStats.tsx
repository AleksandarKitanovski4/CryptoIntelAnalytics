import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TIMEFRAMES } from '../types/crypto';

interface AccuracyStats {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  bullishAccuracy: number;
  bearishAccuracy: number;
  neutralAccuracy: number;
  byTimeframe: Record<string, number>;
  byCoin: Record<string, number>;
}

interface AccuracyStatsProps {
  selectedCoin?: string;
  selectedTimeframe: string;
}

export function AccuracyStats({ selectedCoin, selectedTimeframe }: AccuracyStatsProps) {
  const [stats, setStats] = useState<AccuracyStats | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedCoin) {
      fetchAccuracyStats();
    }
  }, [selectedCoin, selectedTimeframe, timeRange]);

  const fetchAccuracyStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/accuracy?coinSymbol=${selectedCoin}&timeframe=${selectedTimeframe}&timeRange=${timeRange}`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching accuracy stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!stats) {
    return (
      <Card className="p-6 bg-crypto-card border-crypto-border">
        <p className="text-gray-400">Select a coin to view accuracy statistics</p>
      </Card>
    );
  }

  const chartData = Object.entries(stats.byTimeframe).map(([timeframe, accuracy]) => ({
    timeframe,
    accuracy
  }));

  return (
    <div className="space-y-6">
      {/* Overall Accuracy */}
      <Card className="p-6 bg-crypto-card border-crypto-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Overall Accuracy</h3>
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' }
            ]}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{stats.accuracy}%</p>
            <p className="text-sm text-gray-400">Overall</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-500">{stats.bullishAccuracy}%</p>
            <p className="text-sm text-gray-400">Bullish</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-500">{stats.bearishAccuracy}%</p>
            <p className="text-sm text-gray-400">Bearish</p>
          </div>
        </div>
      </Card>

      {/* Accuracy by Timeframe */}
      <Card className="p-6 bg-crypto-card border-crypto-border">
        <h3 className="text-lg font-semibold text-white mb-4">Accuracy by Timeframe</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timeframe"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.375rem'
                }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Prediction Stats */}
      <Card className="p-6 bg-crypto-card border-crypto-border">
        <h3 className="text-lg font-semibold text-white mb-4">Prediction Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Total Predictions</p>
            <p className="text-2xl font-bold text-white">{stats.totalPredictions}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Correct Predictions</p>
            <p className="text-2xl font-bold text-white">{stats.correctPredictions}</p>
          </div>
        </div>
      </Card>
    </div>
  );
} 