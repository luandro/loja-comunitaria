import type { OrderRequestData } from '@/lib/order-request';

interface OrderRequestFormProps {
  data: OrderRequestData;
  onChange: (patch: Partial<OrderRequestData>) => void;
}

const inputClass =
  'w-full rounded border border-sand-200 bg-white px-3 py-2 text-forest-900 outline-none focus:border-forest-600';

export const OrderRequestForm = ({ data, onChange }: OrderRequestFormProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-forest-900 mb-1">Solicitação do pedido</h2>
      <p className="text-sm text-forest-700 mb-4">
        Preencha seus dados para gerar a mensagem que será enviada à loja pelo WhatsApp.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="or-name" className="block text-sm text-forest-800 mb-1">
            Nome *
          </label>
          <input
            id="or-name"
            className={inputClass}
            value={data.name}
            maxLength={100}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="or-phone" className="block text-sm text-forest-800 mb-1">
            Telefone (opcional)
          </label>
          <input
            id="or-phone"
            className={inputClass}
            value={data.phone}
            maxLength={20}
            inputMode="tel"
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="or-zip" className="block text-sm text-forest-800 mb-1">
            CEP
          </label>
          <input
            id="or-zip"
            className={inputClass}
            value={data.zip}
            maxLength={9}
            inputMode="numeric"
            onChange={(e) => onChange({ zip: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="or-city" className="block text-sm text-forest-800 mb-1">
            Cidade *
          </label>
          <input
            id="or-city"
            className={inputClass}
            value={data.city}
            maxLength={80}
            onChange={(e) => onChange({ city: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="or-state" className="block text-sm text-forest-800 mb-1">
            Estado (UF) *
          </label>
          <input
            id="or-state"
            className={inputClass}
            value={data.state}
            maxLength={20}
            onChange={(e) => onChange({ state: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <span className="block text-sm text-forest-800 mb-1">Entrega ou retirada</span>
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
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="or-notes" className="block text-sm text-forest-800 mb-1">
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
