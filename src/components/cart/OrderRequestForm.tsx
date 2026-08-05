import { useCallback, useRef, useState } from 'react';
import { formatCep, normalizeCep, type AddressLookupResult } from '@/lib/cep';
import { useCepLookup } from '@/hooks/use-cep-lookup';
import type { AutoFilledAddressField, OrderRequestData } from '@/lib/order-request';

interface CepMessages {
  enabled: boolean;
  privacyNotice: string;
  loading: string;
  success: string;
  partial: string;
  error: string;
}

interface OrderRequestFormProps {
  data: OrderRequestData;
  onChange: (patch: Partial<OrderRequestData>) => void;
  cep?: Partial<CepMessages>;
}

const DEFAULT_CEP_MESSAGES: CepMessages = {
  enabled: true,
  privacyNotice:
    'O CEP é consultado em um serviço público para ajudar a preencher o endereço. Confira os dados antes de enviar.',
  loading: 'Buscando endereço…',
  success: 'Endereço encontrado. Confira os dados e informe o número.',
  partial: 'Encontramos apenas parte do endereço. Complete os campos que faltam.',
  error: 'Não foi possível consultar o CEP agora. Você pode preencher o endereço manualmente.',
};

const NOT_FOUND_MESSAGE =
  'CEP não encontrado. Confira o número ou preencha o endereço manualmente.';
const INVALID_MESSAGE = 'Digite um CEP com 8 números.';

const inputClass =
  'w-full rounded border border-sand-200 bg-white px-3 py-2 text-forest-900 outline-none focus:border-forest-600';
const labelClass = 'block text-sm text-forest-800 mb-1';

export const OrderRequestForm = ({ data, onChange, cep }: OrderRequestFormProps) => {
  const messages = { ...DEFAULT_CEP_MESSAGES, ...cep };
  const numberRef = useRef<HTMLInputElement>(null);
  const [cepTouched, setCepTouched] = useState(false);
  /** Fields written by the lookup and not manually edited since. */
  const [autoFilled, setAutoFilled] = useState<Set<AutoFilledAddressField>>(new Set());

  const isDelivery = data.delivery === 'entrega';

  const applyResult = useCallback(
    (result: AddressLookupResult) => {
      const patch: Partial<OrderRequestData> = {};
      const next = new Set<AutoFilledAddressField>();
      (['street', 'neighborhood', 'city', 'state'] as const).forEach((field) => {
        if (result[field]) {
          patch[field] = result[field];
          next.add(field);
        }
      });
      setAutoFilled(next);
      onChange(patch);
      // Focus the number field only on pointer/keyboard flows; harmless and reversible.
      window.setTimeout(() => numberRef.current?.focus({ preventScroll: true }), 0);
    },
    [onChange],
  );

  const clearAutoFilled = useCallback(() => {
    if (autoFilled.size === 0) return;
    const patch: Partial<OrderRequestData> = {};
    autoFilled.forEach((field) => {
      patch[field] = '';
    });
    setAutoFilled(new Set());
    onChange(patch);
  }, [autoFilled, onChange]);

  const { status, handleChange, handleBlur, retry } = useCepLookup({
    enabled: messages.enabled,
    onResult: applyResult,
    onNotFound: clearAutoFilled,
  });

  const markManual = (field: AutoFilledAddressField) => {
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

  const statusMessage =
    status === 'loading'
      ? messages.loading
      : status === 'success'
        ? messages.success
        : status === 'partial'
          ? messages.partial
          : status === 'not_found'
            ? NOT_FOUND_MESSAGE
            : status === 'error'
              ? messages.error
              : status === 'invalid' && cepTouched
                ? INVALID_MESSAGE
                : '';

  const hasError = status === 'error' || status === 'not_found' || status === 'invalid';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-forest-900 mb-1">Solicitação do pedido</h2>
      <p className="text-sm text-forest-700 mb-4">
        Preencha seus dados para gerar a mensagem que será enviada à loja pelo WhatsApp.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="or-name" className={labelClass}>
            Nome *
          </label>
          <input
            id="or-name"
            className={inputClass}
            value={data.name}
            maxLength={100}
            autoComplete="name"
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="or-phone" className={labelClass}>
            Telefone (opcional)
          </label>
          <input
            id="or-phone"
            className={inputClass}
            value={data.phone}
            maxLength={20}
            inputMode="tel"
            autoComplete="tel"
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <span className={labelClass}>Entrega ou retirada</span>
          <div className="flex gap-4">
            {(['entrega', 'retirada'] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-forest-800">
                <input
                  type="radio"
                  name="delivery"
                  value={opt}
                  checked={data.delivery === opt}
                  onChange={() => onChange({ delivery: opt })}
                />
                <span className="capitalize">{opt}</span>
              </label>
            ))}
          </div>
          {!isDelivery && (
            <p className="mt-2 text-sm text-forest-700">
              Na retirada não é preciso informar endereço. Seus dados de entrega ficam salvos
              caso você volte para “entrega”.
            </p>
          )}
        </div>

        {isDelivery && (
          <>
            <div className="sm:col-span-2">
              <label htmlFor="or-cep" className={labelClass}>
                CEP
              </label>
              <input
                id="or-cep"
                className={inputClass}
                value={formatCep(data.cep)}
                maxLength={9}
                inputMode="numeric"
                autoComplete="postal-code"
                aria-describedby="or-cep-help or-cep-status"
                aria-invalid={hasError || undefined}
                onChange={(e) => onCepChange(e.target.value)}
                onBlur={(e) => {
                  setCepTouched(true);
                  handleBlur(e.target.value);
                }}
              />
              <p id="or-cep-help" className="mt-1 text-xs text-forest-600">
                {messages.privacyNotice}
              </p>
              <p
                id="or-cep-status"
                aria-live="polite"
                className={`mt-1 min-h-[1.25rem] text-sm ${
                  hasError ? 'text-terra-700 font-medium' : 'text-forest-700'
                }`}
              >
                {statusMessage}
              </p>
              {(status === 'error' || status === 'not_found') && (
                <button
                  type="button"
                  className="text-sm underline text-forest-800"
                  onClick={() => retry(data.cep)}
                >
                  Tentar consultar o CEP novamente
                </button>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="or-street" className={labelClass}>
                Logradouro
              </label>
              <input
                id="or-street"
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

            <div>
              <label htmlFor="or-number" className={labelClass}>
                Número *
              </label>
              <input
                id="or-number"
                ref={numberRef}
                className={inputClass}
                value={data.noNumber ? 'S/N' : data.number}
                disabled={data.noNumber}
                maxLength={20}
                onChange={(e) => onChange({ number: e.target.value })}
              />
              <label className="mt-2 flex items-center gap-2 text-sm text-forest-800">
                <input
                  type="checkbox"
                  checked={data.noNumber}
                  onChange={(e) => onChange({ noNumber: e.target.checked })}
                />
                <span>Sem número</span>
              </label>
            </div>

            <div>
              <label htmlFor="or-complement" className={labelClass}>
                Complemento (opcional)
              </label>
              <input
                id="or-complement"
                className={inputClass}
                value={data.complement}
                maxLength={80}
                autoComplete="address-line2"
                onChange={(e) => onChange({ complement: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="or-neighborhood" className={labelClass}>
                Bairro
              </label>
              <input
                id="or-neighborhood"
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
              <label htmlFor="or-city" className={labelClass}>
                Cidade *
              </label>
              <input
                id="or-city"
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
              <label htmlFor="or-state" className={labelClass}>
                Estado (UF) *
              </label>
              <input
                id="or-state"
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

            <div className="sm:col-span-2">
              <label htmlFor="or-landmark" className={labelClass}>
                Ponto de referência (opcional)
              </label>
              <input
                id="or-landmark"
                className={inputClass}
                value={data.landmark}
                maxLength={200}
                onChange={(e) => onChange({ landmark: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label htmlFor="or-notes" className={labelClass}>
            Observações (opcional)
          </label>
          <textarea
            id="or-notes"
            className={`${inputClass} min-h-[80px]`}
            value={data.notes}
            maxLength={500}
            onChange={(e) => onChange({ notes: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-start gap-2 text-sm text-forest-800">
            <input
              type="checkbox"
              className="mt-1"
              checked={data.acknowledged}
              onChange={(e) => onChange({ acknowledged: e.target.checked })}
            />
            <span>
              Entendo que produtos, prazo e frete ainda precisam ser confirmados pela loja.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
