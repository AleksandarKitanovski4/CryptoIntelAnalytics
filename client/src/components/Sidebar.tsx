import { TrendingUp } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CoinSelector } from './CoinSelector';
import { TimeframeSelector } from './TimeframeSelector';
import { IndicatorSelector } from './IndicatorSelector';
import type { CoinData } from '../types/crypto';

interface SidebarProps {
  selectedCoins: CoinData[];
  allCoins: CoinData[];
  selectedTimeframe: string;
  selectedIndicators: string[];
  onAddCoin: (symbol: string) => void;
  onRemoveCoin: (symbol: string) => void;
  onTimeframeChange: (timeframe: string) => void;
  onToggleIndicator: (indicator: string) => void;
}

export function Sidebar({
  selectedCoins,
  allCoins,
  selectedTimeframe,
  selectedIndicators,
  onAddCoin,
  onRemoveCoin,
  onTimeframeChange,
  onToggleIndicator
}: SidebarProps) {
  return (
    <aside className="w-80 bg-crypto-card border-r border-crypto-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-crypto-border">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-crypto-accent to-blue-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Crypto Intel</h1>
            <p className="text-sm text-gray-400">Assistant Dashboard</p>
          </div>
        </div>
        
        <ThemeToggle />
      </div>
      
      {/* Coin Selector */}
      <CoinSelector
        selectedCoins={selectedCoins}
        allCoins={allCoins}
        onAddCoin={onAddCoin}
        onRemoveCoin={onRemoveCoin}
      />
      
      {/* Timeframe Selector */}
      <TimeframeSelector
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={onTimeframeChange}
      />
      
      {/* Indicator Selector */}
      <IndicatorSelector
        selectedIndicators={selectedIndicators}
        onToggleIndicator={onToggleIndicator}
      />
    </aside>
  );
}
