import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Button } from '@/components/ui/button';
import { ExpandIcon, DownloadIcon } from 'lucide-react';
import { priceChartOptions, getChartColors, formatPrice, formatPercentage } from '../utils/chartConfig';
import type { CoinData } from '../types/crypto';

Chart.register(...registerables);

interface PriceChartProps {
  selectedCoin: CoinData;
  timeframe: string;
  chartData?: any;
}

export function PriceChart({ selectedCoin, timeframe, chartData }: PriceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const colors = getChartColors();
    
    // Generate mock data for demonstration
    const generateMockData = () => {
      const data = [];
      const labels = [];
      let basePrice = parseFloat(selectedCoin.currentPrice);
      
      for (let i = 47; i >= 0; i--) {
        const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
        labels.push(timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        
        // Add some realistic price movement
        const variation = (Math.random() - 0.5) * 0.02; // 2% max variation
        basePrice *= (1 + variation);
        data.push(basePrice);
      }
      
      return { labels, data };
    };

    const mockData = generateMockData();

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: mockData.labels,
        datasets: [
          {
            label: `${selectedCoin.symbol} Price`,
            data: mockData.data,
            borderColor: colors.primary,
            backgroundColor: colors.primary + '20',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: priceChartOptions,
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [selectedCoin, timeframe, chartData]);

  const currentPrice = parseFloat(selectedCoin.currentPrice);
  const priceChange = parseFloat(selectedCoin.priceChange24h);
  const priceChangeColor = priceChange >= 0 ? 'text-bullish' : 'text-bearish';

  return (
    <div className="bg-crypto-card rounded-xl border border-crypto-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">{selectedCoin.symbol}/USD</h3>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">{formatPrice(currentPrice)}</span>
            <span className={`text-sm ${priceChangeColor}`}>
              {formatPercentage(priceChange)} ({priceChange >= 0 ? '+' : ''}${(currentPrice * priceChange / 100).toFixed(2)})
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            className="bg-crypto-accent text-crypto-dark hover:bg-crypto-accent/90"
          >
            Candlestick
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-crypto-border text-white hover:border-crypto-accent"
          >
            Line
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-crypto-border text-white hover:border-crypto-accent"
          >
            Area
          </Button>
        </div>
      </div>
      
      <div className="h-96 bg-crypto-dark rounded-lg p-4">
        <canvas ref={chartRef} className="w-full h-full" />
      </div>
      
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span className="text-gray-400">MA(20): {formatPrice(currentPrice * 0.99)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-orange-500"></div>
            <span className="text-gray-400">MA(50): {formatPrice(currentPrice * 0.97)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-purple-500"></div>
            <span className="text-gray-400">Bollinger Upper: {formatPrice(currentPrice * 1.05)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-1"
          >
            <ExpandIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-1"
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
