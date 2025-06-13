import { Checkbox } from '@/components/ui/checkbox';
import { INDICATOR_CATEGORIES } from '../types/crypto';

interface IndicatorSelectorProps {
  selectedIndicators: string[];
  onToggleIndicator: (indicator: string) => void;
}

export function IndicatorSelector({ selectedIndicators, onToggleIndicator }: IndicatorSelectorProps) {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">INDICATORS</h3>
      
      <div className="space-y-4">
        {Object.entries(INDICATOR_CATEGORIES).map(([key, category]) => (
          <div key={key}>
            <h4 className="text-xs font-medium text-gray-400 mb-2">{category.title}</h4>
            <div className="space-y-1">
              {category.indicators.map((indicator) => (
                <div key={indicator} className="flex items-center space-x-2">
                  <Checkbox
                    id={indicator}
                    checked={selectedIndicators.includes(indicator)}
                    onCheckedChange={() => onToggleIndicator(indicator)}
                    className="border-crypto-border data-[state=checked]:bg-crypto-accent data-[state=checked]:border-crypto-accent"
                  />
                  <label
                    htmlFor={indicator}
                    className="text-sm text-white cursor-pointer"
                  >
                    {indicator}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
