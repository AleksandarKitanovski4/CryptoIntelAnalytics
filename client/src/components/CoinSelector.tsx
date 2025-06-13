import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import type { CoinData } from '../types/crypto';
import { formatPrice, formatPercentage } from '../utils/chartConfig';

interface CoinSelectorProps {
  selectedCoins: CoinData[];
  allCoins: CoinData[];
  onAddCoin: (symbol: string) => void;
  onRemoveCoin: (symbol: string) => void;
}

export function CoinSelector({ selectedCoins, allCoins, onAddCoin, onRemoveCoin }: CoinSelectorProps) {
  const [showAddCoin, setShowAddCoin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availableCoins = allCoins.filter(coin => 
    !selectedCoins.some(selected => selected.symbol === coin.symbol) &&
    (coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
     coin.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCoinGradient = (symbol: string) => {
    const gradients: Record<string, string> = {
      'BTC': 'from-orange-500 to-yellow-500',
      'ETH': 'from-blue-500 to-purple-500',
      'SOL': 'from-purple-500 to-pink-500',
      'ADA': 'from-blue-600 to-blue-400',
      'DOT': 'from-pink-500 to-red-500',
      'LINK': 'from-blue-400 to-indigo-600',
      'MATIC': 'from-purple-600 to-indigo-600',
      'AVAX': 'from-red-500 to-orange-500',
      'UNI': 'from-pink-400 to-purple-600',
      'ATOM': 'from-indigo-500 to-purple-600',
    };
    return gradients[symbol] || 'from-gray-500 to-gray-600';
  };

  const getPriceChangeColor = (change: string) => {
    const value = parseFloat(change);
    if (value > 0) return 'text-bullish';
    if (value < 0) return 'text-bearish';
    return 'text-neutral';
  };

  return (
    <div className="p-6 border-b border-crypto-border">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">SELECT COINS</h3>
      
      <div className="space-y-2">
        {selectedCoins.map((coin) => (
          <div key={coin.symbol} className="flex items-center justify-between p-3 bg-crypto-dark rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-gradient-to-r ${getCoinGradient(coin.symbol)} rounded-full flex items-center justify-center text-xs font-bold text-white`}>
                {coin.symbol.slice(0, 3)}
              </div>
              <div>
                <p className="font-medium text-white">{coin.name}</p>
                <p className="text-xs text-gray-400">{formatPrice(parseFloat(coin.currentPrice))}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${getPriceChangeColor(coin.priceChange24h)}`}>
                {formatPercentage(parseFloat(coin.priceChange24h))}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveCoin(coin.symbol)}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showAddCoin ? (
        <div className="mt-3 space-y-2">
          <Input
            placeholder="Search coins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-crypto-dark border-crypto-border text-white"
          />
          
          <div className="max-h-32 overflow-y-auto space-y-1">
            {availableCoins.slice(0, 5).map((coin) => (
              <Button
                key={coin.symbol}
                variant="ghost"
                className="w-full justify-start p-2 h-auto text-white hover:bg-crypto-border"
                onClick={() => {
                  onAddCoin(coin.symbol);
                  setShowAddCoin(false);
                  setSearchQuery('');
                }}
              >
                <div className={`w-6 h-6 bg-gradient-to-r ${getCoinGradient(coin.symbol)} rounded-full flex items-center justify-center text-xs font-bold text-white mr-2`}>
                  {coin.symbol.slice(0, 2)}
                </div>
                <span className="text-sm">{coin.symbol} - {coin.name}</span>
              </Button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddCoin(false);
                setSearchQuery('');
              }}
              className="flex-1 border-crypto-border text-white hover:bg-crypto-border"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full mt-3 border-crypto-border text-gray-400 hover:text-white hover:border-crypto-accent transition-colors"
          onClick={() => setShowAddCoin(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Coin
        </Button>
      )}
    </div>
  );
}
