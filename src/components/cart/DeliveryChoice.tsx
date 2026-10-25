import { useEffect } from 'react';
import { MapPin, Truck } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import type { DeliveryMethod } from '@/lib/checkout';

interface DeliveryChoiceProps {
  value: DeliveryMethod;
  onChange: (value: DeliveryMethod) => void;
  pickupAvailable: boolean;
}

/**
 * Two large touch-friendly cards. When only one option exists it is
 * preselected automatically and the question is not shown at all.
 */
export const DeliveryChoice = ({ value, onChange, pickupAvailable }: DeliveryChoiceProps) => {
  const store = useStore();
  const options: DeliveryMethod[] = pickupAvailable ? ['entrega', 'retirada'] : ['entrega'];

  useEffect(() => {
    if (options.length === 1 && value !== options[0]) onChange(options[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupAvailable]);

  if (options.length === 1) return null;

  return (
    <section aria-labelledby="delivery-question" className="mt-6">
      <h2 id="delivery-question" className="text-lg font-semibold text-forest-900 mb-3">
        {store.t('delivery_question')}
      </h2>
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="delivery-question">
        {options.map((opt) => {
          const selected = value === opt;
          const Icon = opt === 'entrega' ? Truck : MapPin;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt)}
              className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-lg border-2 p-4 text-base font-medium transition-colors ${
                selected
                  ? 'border-forest-600 bg-forest-50 text-forest-900'
                  : 'border-sand-200 bg-white text-forest-700 hover:border-sand-300'
              }`}
            >
              <Icon className="h-6 w-6" aria-hidden />
              {store.t(opt === 'entrega' ? 'delivery_option' : 'pickup_option')}
            </button>
          );
        })}
      </div>
    </section>
  );
};
