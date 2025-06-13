import { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainContent } from '@/components/MainContent';
import { useMarketData } from '@/hooks/useMarketData';

export default function Dashboard() {
  const {
    coins,
    allCoins,
    fearGreedIndex,
    isLoading,
    connectionStatus,
    selectedCoins,
    selectedTimeframe,
    selectedIndicators,
    setSelectedTimeframe,
    addCoin,
    removeCoin,
    toggleIndicator,
    registerMessageHandler,
    unregisterMessageHandler
  } = useMarketData();

  // Set page title
  useEffect(() => {
    document.title = 'Crypto Intel Assistant - Professional Trading Dashboard';
  }, []);

  return (
    <div className="min-h-screen flex bg-crypto-dark text-white">
      {/* Sidebar */}
      <Sidebar
        selectedCoins={coins}
        allCoins={allCoins}
        selectedTimeframe={selectedTimeframe}
        selectedIndicators={selectedIndicators}
        onAddCoin={addCoin}
        onRemoveCoin={removeCoin}
        onTimeframeChange={setSelectedTimeframe}
        onToggleIndicator={toggleIndicator}
      />
      
      {/* Main Content */}
      <MainContent
        selectedCoins={coins}
        selectedTimeframe={selectedTimeframe}
        selectedIndicators={selectedIndicators}
        fearGreedIndex={fearGreedIndex}
        connectionStatus={connectionStatus}
        isLoading={isLoading}
        registerMessageHandler={registerMessageHandler}
        unregisterMessageHandler={unregisterMessageHandler}
      />
    </div>
  );
}
