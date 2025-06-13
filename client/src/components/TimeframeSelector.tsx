import { Button } from '@/components/ui/button';
import { TIMEFRAMES } from '../types/crypto';

interface TimeframeSelectorProps {
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

export function TimeframeSelector({ selectedTimeframe, onTimeframeChange }: TimeframeSelectorProps) {
  return (
    <div className="p-6 border-b border-crypto-border">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">TIMEFRAME</h3>
      <div className="grid grid-cols-3 gap-2">
        {TIMEFRAMES.map((timeframe) => (
          <Button
            key={timeframe.value}
            variant={selectedTimeframe === timeframe.value ? "default" : "outline"}
            size="sm"
            className={`text-xs ${
              selectedTimeframe === timeframe.value
                ? 'bg-crypto-accent text-crypto-dark font-medium hover:bg-crypto-accent/90'
                : 'border-crypto-border text-white hover:border-crypto-accent transition-colors'
            }`}
            onClick={() => onTimeframeChange(timeframe.value)}
          >
            {timeframe.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
