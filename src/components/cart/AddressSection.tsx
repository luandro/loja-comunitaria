import { useCallback, useRef, useState } from 'react';
import { formatCep, normalizeCep, type AddressLookupResult } from '@/lib/cep';
import { useCepLookup } from '@/hooks/use-cep-lookup';
import { useStore } from '@/hooks/use-store';
import type { CheckoutData } from '@/lib/checkout';

interface AddressSectionProps {
  data: CheckoutData;
  onChange: (patch: Partial<CheckoutData>) => void;
  cepEnabled?: boolean;
}

type AutoField = 'street' | 'neighborhood' | 'city' | 'state';

const inputClass =
  'w-full rounded border border-sand-200 bg-white px-3 py-3 text-base text-forest-900 outline-none focus:border-forest-600';
const labelClass = 'block text-sm font-medium text-forest-800 mb-1';

/**
 * CEP-first delivery address. On a successful lookup the result collapses
 * into one concise line with an "Editar" action; on failure the manual
 * fields expand smoothly and nothing blocks the checkout. Rural, Indigenous
 * and riverside addresses without a usable CEP are fully supported through
 * the manual path.
 */
export const AddressSection = ({ data, onChange, cepEnabled = true }: AddressSectionProps) => {
  const store = useStore();
  const numberRef = useRef<HTMLInputElement>(null);
  /** Fields written by the lookup and not manually edited since. */
  const [autoFilled, setAutoFilled] = useState<Set<AutoField>>(new Set());
  const [manual, setManual] = useState(false);

  const applyResult = useCallback(
    (result: AddressLookupResult) => {
      const patch: Partial<CheckoutData> = {};
      const next = new Set<AutoField>();
      (['street', 'neighborhood', 'city', 'state'] as const).forEach((field) => {
        if (result[field]) {
          patch[field] = result[field];
          next.add(field);
        }
      });
      setAutoFilled(next);
      setManual(false);
      onChange(patch);
      window.setTimeout(() => numberRef.current?.focus({ preventScroll: true }), 0);
    },
    [onChange],
  );

  const clearAutoFilled = useCallback(() => {
    if (autoFilled.size === 0) return;
    const patch: Partial<CheckoutData> = {};
    autoFilled.forEach((field) => {
      patch[field] = '';
    });
    setAutoFilled(new Set());
    onChange(patch);
  }, [autoFilled, onChange]);

  const { status, handleChange, handleBlur, retry } = useCepLookup({
    enabled: cepEnabled,
    onResult: applyResult,
    onNotFound: clearAutoFilled,
  });

  const markManual = (field: AutoField) => {
    if (!autoFilled.has(field)) return;
    const next = new Set(autoFilled);
    next.delete(field);
    setAutoFilled(next);
  };

  const onCepChange = (value: string) => {
    const digits = normalizeCep(value);
    onChange({ cep: digits });
    if (digits.length < 8) clearAutoFilled();
    handleChange(digits);
  };

  const found = status === 'success' || status === 'partial';
  const failed = status === 'not_found' || status === 'error';
  const showManual = manual || failed || (!found && data.cep.length === 0 && manual);
  const showSummary = found && !manual;

  const summary = [
    data.street || data.neighborhood,
    data.city && data.state ? `${data.city}, ${data.state}` : data.city || data.state,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section aria-label={store.t('delivery_option')} className="mt-6 space-y-4">
      <div>
        <label htmlFor="ck-cep" className={labelClass}>
          {store.t('cep_label')}
        </label>
        <input
          id="ck-cep"
          className={inputClass}
          value={formatCep(data.cep)}
          maxLength={9}
          inputMode="numeric"
          autoComplete="postal-code"
          aria-describedby="ck-cep-status"
          onChange={(e) => onCepChange(e.target.value)}
          onBlur={(e) => handleBlur(e.target.value)}
        />
        <p id="ck-cep-status" aria-live="polite" className="mt-1 min-h-[1.25rem] text-sm text-forest-700">
          {status === 'loading' && store.t('cep_searching')}
          {failed && store.t('cep_not_found_manual')}
        </p>
        {failed && (
          <button
            type="button"
            className="text-sm underline text-forest-800"
            onClick={() => retry(data.cep)}
          >
            {store.t('catalog_retry')}
          </button>
        )}
      </div>

      {showSummary && (
        <p className="flex items-center justify-between gap-3 rounded-lg bg-forest-50 px-3 py-2 text-sm text-forest-900">
          <span className="min-w-0 truncate">{summary}</span>
          <button
            type="button"
            className="shrink-0 underline font-medium"
            onClick={() => setManual(true)}
          >
            {store.t('edit_label')}
          </button>
        </p>
      )}

      {!found && !manual && !failed && (
        <button
          type="button"
          className="text-sm underline text-forest-800"
          onClick={() => setManual(true)}
        >
          {store.t('manual_address_toggle')}
        </button>
      )}

      {showManual && (
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label htmlFor="ck-street" className={labelClass}>
              {store.t('street_label')}
            </label>
            <input
              id="ck-street"
              className={inputClass}
              value={data.street}
              maxLength={120}
              autoComplete="address-line1"
              onChange={(e) => {
                markManual('street');
                onChange({ street: e.target.value });
              }}
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="ck-neighborhood" className={labelClass}>
              {store.t('neighborhood_label')}
            </label>
            <input
              id="ck-neighborhood"
              className={inputClass}
              value={data.neighborhood}
              maxLength={80}
              onChange={(e) => {
                markManual('neighborhood');
                onChange({ neighborhood: e.target.value });
              }}
            />
          </div>
          <div>
            <label htmlFor="ck-city" className={labelClass}>
              {store.t('city_label')} *
            </label>
            <input
              id="ck-city"
              className={inputClass}
              value={data.city}
              maxLength={80}
              autoComplete="address-level2"
              onChange={(e) => {
                markManual('city');
                onChange({ city: e.target.value });
              }}
            />
          </div>
          <div>
            <label htmlFor="ck-state" className={labelClass}>
              {store.t('state_label')} *
            </label>
            <input
              id="ck-state"
              className={inputClass}
              value={data.state}
              maxLength={20}
              autoComplete="address-level1"
              onChange={(e) => {
                markManual('state');
                onChange({ state: e.target.value });
              }}
            />
          </div>
        </div>
      )}

      {(found || showManual) && (
        <>
          <div>
            <label htmlFor="ck-number" className={labelClass}>
              {store.t('number_label')} *
            </label>
            <div className="flex items-center gap-3">
              <input
                id="ck-number"
                ref={numberRef}
                className={`${inputClass} w-28`}
                value={data.noNumber ? 'S/N' : data.number}
                disabled={data.noNumber}
                maxLength={20}
                inputMode="numeric"
                onChange={(e) => onChange({ number: e.target.value })}
              />
              <label className="flex min-h-[44px] items-center gap-2 text-sm text-forest-800">
                <input
                  type="checkbox"
                  checked={data.noNumber}
                  onChange={(e) => onChange({ noNumber: e.target.checked })}
                />
                <span>{store.t('no_number')}</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="ck-complement" className={labelClass}>
              {store.t('complement_reference_label')}
            </label>
            <input
              id="ck-complement"
              className={inputClass}
              value={data.complement}
              maxLength={200}
              placeholder={store.t('complement_reference_placeholder')}
              onChange={(e) => onChange({ complement: e.target.value })}
            />
          </div>
        </>
      )}
    </section>
  );
};
