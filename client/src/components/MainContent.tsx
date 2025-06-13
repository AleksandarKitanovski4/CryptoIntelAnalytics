import { Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PriceChart } from './PriceChart';
import { IndicatorCharts } from './IndicatorCharts';
import { MarketSummary } from './MarketSummary';
import { AIAssistant } from './AIAssistant';
import type { CoinData } from '../types/crypto';

interface MainContentProps {
  selectedCoins: CoinData[];
  selectedTimeframe: string;
  selectedIndicators: string[];
  fearGreedIndex: number;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  isLoading: boolean;
  registerMessageHandler: (type: string, handler: (data: any) => void) => void;
  unregisterMessageHandler: (type: string) => void;
}

export function MainContent({
  selectedCoins,
  selectedTimeframe,
  selectedIndicators,
  fearGreedIndex,
  connectionStatus,
  isLoading,
  registerMessageHandler,
  unregisterMessageHandler
}: MainContentProps) {
  const primaryCoin = selectedCoins[0]; // Use first selected coin as primary

  const getFearGreedColor = (value: number) => {
    if (value <= 25) return 'bg-bearish';
    if (value <= 50) return 'bg-neutral';
    if (value <= 75) return 'bg-bullish';
    return 'bg-bullish';
  };

  const getFearGreedLabel = (value: number) => {
    if (value <= 25) return 'Extreme Fear';
    if (value <= 45) return 'Fear';
    if (value <= 55) return 'Neutral';
    if (value <= 75) return 'Greed';
    return 'Extreme Greed';
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-bullish';
      case 'connecting': return 'bg-neutral';
      case 'disconnected': return 'bg-bearish';
      default: return 'bg-neutral';
    }
  };

  if (isLoading && selectedCoins.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crypto-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading market data...</p>
        </div>
      </main>
    );
  }

  if (selectedCoins.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">No Coins Selected</h2>
          <p className="text-gray-400">Please select one or more cryptocurrencies from the sidebar to begin analysis.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      {/* Top Bar */}
      <header className="h-16 bg-crypto-card border-b border-crypto-border flex items-center justify-between px-6">
        <div className="flex items-center space-x-6">
          <h2 className="text-lg font-semibold text-white">Market Analysis Dashboard</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 ${getConnectionStatusColor()} rounded-full ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm text-gray-400">
              {connectionStatus === 'connected' ? 'Live Data' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Fear & Greed Index */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Fear & Greed:</span>
            <div className="flex items-center space-x-1">
              <div className="w-16 h-2 bg-crypto-border rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getFearGreedColor(fearGreedIndex)} rounded-full transition-all duration-300`}
                  style={{ width: `${fearGreedIndex}%` }}
                ></div>
              </div>
              <span className={`text-sm font-medium ${
                fearGreedIndex <= 25 ? 'text-bearish' :
                fearGreedIndex <= 50 ? 'text-neutral' :
                'text-bullish'
              }`}>
                {fearGreedIndex}
              </span>
            </div>
            <span className="text-xs text-gray-500">({getFearGreedLabel(fearGreedIndex)})</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-2"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-2"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Charts Section */}
        <div className="flex-1 p-6 space-y-6">
          {/* Price Chart */}
          {primaryCoin && (
            <PriceChart
              selectedCoin={primaryCoin}
              timeframe={selectedTimeframe}
            />
          )}
          
          {/* Indicator Charts */}
          {primaryCoin && (
            <IndicatorCharts
              selectedCoin={primaryCoin}
              selectedIndicators={selectedIndicators}
            />
          )}
          
          {/* Market Summary */}
          {primaryCoin && (
            <MarketSummary
              selectedCoin={primaryCoin}
              selectedTimeframe={selectedTimeframe}
            />
          )}
        </div>
        
        {/* AI Assistant */}
        <AIAssistant
          selectedCoin={primaryCoin}
          selectedTimeframe={selectedTimeframe}
        />
      </div>
    </main>
  );
}
