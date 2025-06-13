import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { CoinData, IndicatorData, MarketAnalysis } from '../types/crypto';
import { useWebSocket } from './useWebSocket';

export function useMarketData() {
  const [selectedCoins, setSelectedCoins] = useState<string[]>(['BTC', 'ETH', 'SOL']);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [selectedIndicators, setSelectedIndicators] = useState([
    'Moving Averages', 'MACD', 'RSI', 'Bollinger Bands', 'Volume'
  ]);

  const { 
    connectionStatus, 
    subscribeToCoin, 
    registerMessageHandler,
    unregisterMessageHandler 
  } = useWebSocket();

  // Query for coins data
  const { data: coins, isLoading: coinsLoading } = useQuery<CoinData[]>({
    queryKey: ['/api/coins'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Query for Fear & Greed Index
  const { data: fearGreedData } = useQuery<{ value: number }>({
    queryKey: ['/api/market/fear-greed'],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  // Subscribe to selected coins when they change
  useEffect(() => {
    if (connectionStatus === 'connected') {
      selectedCoins.forEach(symbol => {
        subscribeToCoin(symbol, selectedTimeframe);
      });
    }
  }, [selectedCoins, selectedTimeframe, connectionStatus, subscribeToCoin]);

  const getSelectedCoinsData = () => {
    if (!coins) return [];
    return coins.filter(coin => selectedCoins.includes(coin.symbol));
  };

  const addCoin = (symbol: string) => {
    if (!selectedCoins.includes(symbol)) {
      setSelectedCoins(prev => [...prev, symbol]);
    }
  };

  const removeCoin = (symbol: string) => {
    setSelectedCoins(prev => prev.filter(s => s !== symbol));
  };

  const toggleIndicator = (indicator: string) => {
    setSelectedIndicators(prev => 
      prev.includes(indicator) 
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  return {
    // Data
    coins: getSelectedCoinsData(),
    allCoins: coins || [],
    fearGreedIndex: fearGreedData?.value || 50,
    
    // Loading states
    isLoading: coinsLoading,
    
    // Connection status
    connectionStatus,
    
    // Selected state
    selectedCoins,
    selectedTimeframe,
    selectedIndicators,
    
    // Actions
    setSelectedTimeframe,
    addCoin,
    removeCoin,
    toggleIndicator,
    
    // WebSocket handlers
    registerMessageHandler,
    unregisterMessageHandler,
    subscribeToCoin
  };
}

export function useCoinAnalysis(symbol: string, timeframe: string) {
  const { data: analysis, isLoading } = useQuery<MarketAnalysis>({
    queryKey: ['/api/analysis', symbol, { timeframe }],
    enabled: !!symbol,
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    analysis,
    isLoading
  };
}

export function useCoinIndicators(symbol: string, timeframe: string, indicatorType?: string) {
  const { data: indicators, isLoading } = useQuery<IndicatorData[]>({
    queryKey: ['/api/coins', symbol, 'indicators', { timeframe, type: indicatorType }],
    enabled: !!symbol,
    refetchInterval: 30000,
  });

  return {
    indicators,
    isLoading
  };
}
