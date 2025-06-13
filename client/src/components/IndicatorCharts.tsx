import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { defaultChartOptions, rsiChartOptions, volumeChartOptions, getChartColors } from '../utils/chartConfig';
import type { CoinData } from '../types/crypto';

Chart.register(...registerables);

interface IndicatorChartsProps {
  selectedCoin: CoinData;
  selectedIndicators: string[];
}

export function IndicatorCharts({ selectedCoin, selectedIndicators }: IndicatorChartsProps) {
  const rsiChartRef = useRef<HTMLCanvasElement>(null);
  const macdChartRef = useRef<HTMLCanvasElement>(null);
  const volumeChartRef = useRef<HTMLCanvasElement>(null);
  const bbChartRef = useRef<HTMLCanvasElement>(null);
  
  const rsiChartInstance = useRef<Chart | null>(null);
  const macdChartInstance = useRef<Chart | null>(null);
  const volumeChartInstance = useRef<Chart | null>(null);
  const bbChartInstance = useRef<Chart | null>(null);

  // Generate mock data
  const generateMockData = (length: number, min: number, max: number) => {
    return Array.from({ length }, () => min + Math.random() * (max - min));
  };

  const generateLabels = (length: number) => {
    return Array.from({ length }, (_, i) => 
      new Date(Date.now() - (length - 1 - i) * 60 * 60 * 1000).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    );
  };

  // RSI Chart
  useEffect(() => {
    if (!rsiChartRef.current || !selectedIndicators.includes('RSI')) return;

    const ctx = rsiChartRef.current.getContext('2d');
    if (!ctx) return;

    if (rsiChartInstance.current) {
      rsiChartInstance.current.destroy();
    }

    const colors = getChartColors();
    const rsiData = generateMockData(24, 20, 80);
    const currentRSI = rsiData[rsiData.length - 1];

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: generateLabels(24),
        datasets: [{
          label: 'RSI',
          data: rsiData,
          borderColor: colors.warning,
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        }],
      },
      options: rsiChartOptions,
    };

    rsiChartInstance.current = new Chart(ctx, config);

    return () => {
      if (rsiChartInstance.current) {
        rsiChartInstance.current.destroy();
      }
    };
  }, [selectedCoin, selectedIndicators]);

  // MACD Chart
  useEffect(() => {
    if (!macdChartRef.current || !selectedIndicators.includes('MACD')) return;

    const ctx = macdChartRef.current.getContext('2d');
    if (!ctx) return;

    if (macdChartInstance.current) {
      macdChartInstance.current.destroy();
    }

    const colors = getChartColors();
    const macdData = generateMockData(24, -200, 200);
    const signalData = generateMockData(24, -150, 150);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: generateLabels(24),
        datasets: [
          {
            label: 'MACD',
            data: macdData,
            borderColor: colors.blue,
            borderWidth: 2,
            fill: false,
          },
          {
            label: 'Signal',
            data: signalData,
            borderColor: colors.secondary,
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: defaultChartOptions,
    };

    macdChartInstance.current = new Chart(ctx, config);

    return () => {
      if (macdChartInstance.current) {
        macdChartInstance.current.destroy();
      }
    };
  }, [selectedCoin, selectedIndicators]);

  // Volume Chart
  useEffect(() => {
    if (!volumeChartRef.current || !selectedIndicators.includes('Volume')) return;

    const ctx = volumeChartRef.current.getContext('2d');
    if (!ctx) return;

    if (volumeChartInstance.current) {
      volumeChartInstance.current.destroy();
    }

    const colors = getChartColors();
    const volumeData = generateMockData(24, 10, 50);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: generateLabels(24),
        datasets: [{
          label: 'Volume',
          data: volumeData,
          backgroundColor: colors.success,
          borderRadius: 2,
        }],
      },
      options: volumeChartOptions,
    };

    volumeChartInstance.current = new Chart(ctx, config);

    return () => {
      if (volumeChartInstance.current) {
        volumeChartInstance.current.destroy();
      }
    };
  }, [selectedCoin, selectedIndicators]);

  // Bollinger Bands Chart
  useEffect(() => {
    if (!bbChartRef.current || !selectedIndicators.includes('Bollinger Bands')) return;

    const ctx = bbChartRef.current.getContext('2d');
    if (!ctx) return;

    if (bbChartInstance.current) {
      bbChartInstance.current.destroy();
    }

    const colors = getChartColors();
    const basePrice = parseFloat(selectedCoin.currentPrice);
    
    const upperBand = generateMockData(24, basePrice * 1.02, basePrice * 1.05);
    const lowerBand = generateMockData(24, basePrice * 0.95, basePrice * 0.98);
    const priceData = generateMockData(24, basePrice * 0.98, basePrice * 1.02);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: generateLabels(24),
        datasets: [
          {
            label: 'Upper Band',
            data: upperBand,
            borderColor: colors.purple,
            borderWidth: 1,
            fill: false,
          },
          {
            label: 'Price',
            data: priceData,
            borderColor: colors.primary,
            borderWidth: 2,
            fill: false,
          },
          {
            label: 'Lower Band',
            data: lowerBand,
            borderColor: colors.purple,
            borderWidth: 1,
            fill: false,
          },
        ],
      },
      options: defaultChartOptions,
    };

    bbChartInstance.current = new Chart(ctx, config);

    return () => {
      if (bbChartInstance.current) {
        bbChartInstance.current.destroy();
      }
    };
  }, [selectedCoin, selectedIndicators]);

  const getRSIStatus = () => {
    const rsi = 47.3; // Mock RSI value
    if (rsi > 70) return { status: 'Overbought', color: 'text-bearish' };
    if (rsi < 30) return { status: 'Oversold', color: 'text-bullish' };
    return { status: 'Neutral', color: 'text-neutral' };
  };

  const getMACDSignal = () => {
    return { signal: 'Bullish Cross', color: 'text-bullish' };
  };

  const rsiStatus = getRSIStatus();
  const macdSignal = getMACDSignal();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* RSI Chart */}
      {selectedIndicators.includes('RSI') && (
        <div className="bg-crypto-card rounded-xl border border-crypto-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">RSI (14)</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Current:</span>
              <span className={`font-medium ${rsiStatus.color}`}>47.3</span>
            </div>
          </div>
          
          <div className="h-32 bg-crypto-dark rounded-lg p-3">
            <canvas ref={rsiChartRef} className="w-full h-full" />
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
            <span>Oversold (30)</span>
            <span>Neutral (50)</span>
            <span>Overbought (70)</span>
          </div>
        </div>
      )}

      {/* MACD Chart */}
      {selectedIndicators.includes('MACD') && (
        <div className="bg-crypto-card rounded-xl border border-crypto-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">MACD (12,26,9)</h4>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${macdSignal.color}`}>{macdSignal.signal}</span>
            </div>
          </div>
          
          <div className="h-32 bg-crypto-dark rounded-lg p-3">
            <canvas ref={macdChartRef} className="w-full h-full" />
          </div>
          
          <div className="flex items-center space-x-4 mt-3 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-400">MACD: 125.3</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-400">Signal: 98.7</span>
            </div>
          </div>
        </div>
      )}

      {/* Volume Chart */}
      {selectedIndicators.includes('Volume') && (
        <div className="bg-crypto-card rounded-xl border border-crypto-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">Volume</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">24h:</span>
              <span className="font-medium text-white">23.8B</span>
            </div>
          </div>
          
          <div className="h-32 bg-crypto-dark rounded-lg p-3">
            <canvas ref={volumeChartRef} className="w-full h-full" />
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
            <span>Avg: 18.2B</span>
            <span>Peak: 45.6B</span>
          </div>
        </div>
      )}

      {/* Bollinger Bands Chart */}
      {selectedIndicators.includes('Bollinger Bands') && (
        <div className="bg-crypto-card rounded-xl border border-crypto-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-white">Bollinger Bands</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral">Mid-Range</span>
            </div>
          </div>
          
          <div className="h-32 bg-crypto-dark rounded-lg p-3">
            <canvas ref={bbChartRef} className="w-full h-full" />
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
            <span>Lower: ${(parseFloat(selectedCoin.currentPrice) * 0.97).toLocaleString()}</span>
            <span>Upper: ${(parseFloat(selectedCoin.currentPrice) * 1.03).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
