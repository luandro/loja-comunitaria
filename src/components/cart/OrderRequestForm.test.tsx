import { useState } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderRequestForm } from '@/components/cart/OrderRequestForm';
import { clearCepCache } from '@/lib/cep';
import { EMPTY_ORDER_REQUEST, type OrderRequestData } from '@/lib/order-request';

const response = (body: unknown, status = 200) =>
  ({ ok: status < 400, status, json: async () => body }) as Response;

const belem = {
  cep: '66000000',
  state: 'PA',
  city: 'Belém',
  neighborhood: 'Centro',
  street: 'Rua Exemplo',
};
const santarem = {
  cep: '68000000',
  state: 'PA',
  city: 'Santarém',
  neighborhood: '',
  street: '',
};

const Harness = () => {
  const [data, setData] = useState<OrderRequestData>(EMPTY_ORDER_REQUEST);
  return (
    <OrderRequestForm
      data={data}
      onChange={(patch) => setData((prev) => ({ ...prev, ...patch }))}
    />
  );
};

describe('OrderRequestForm CEP behaviour', () => {
  beforeEach(() => {
    clearCepCache();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        response(url.endsWith('66000000') ? belem : santarem),
      ),
    );
  });

  it('auto-fills the address and keeps manual edits (15)', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByLabelText('Número *'), '123');
    await user.type(screen.getByLabelText('CEP'), '66000000');

    await waitFor(() =>
      expect(screen.getByLabelText('Cidade *')).toHaveValue('Belém'),
    );
    expect(screen.getByLabelText('Logradouro')).toHaveValue('Rua Exemplo');
    expect(screen.getByLabelText('Número *')).toHaveValue('123');
    expect(
      screen.getByText('Endereço encontrado. Confira os dados e informe o número.'),
    ).toBeInTheDocument();
  });

  it('changing the CEP clears only untouched auto-filled values (16)', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByLabelText('CEP'), '66000000');
    await waitFor(() =>
      expect(screen.getByLabelText('Bairro')).toHaveValue('Centro'),
    );

    const bairro = screen.getByLabelText('Bairro');
    await user.clear(bairro);
    await user.type(bairro, 'Comunidade Exemplo');
    await user.type(screen.getByLabelText('Complemento (opcional)'), 'Casa azul');

    await user.clear(screen.getByLabelText('CEP'));
    await user.type(screen.getByLabelText('CEP'), '68000000');

    await waitFor(() =>
      expect(screen.getByLabelText('Cidade *')).toHaveValue('Santarém'),
    );
    expect(screen.getByLabelText('Bairro')).toHaveValue('Comunidade Exemplo');
    expect(screen.getByLabelText('Complemento (opcional)')).toHaveValue('Casa azul');
    expect(
      screen.getByText('Encontramos apenas parte do endereço. Complete os campos que faltam.'),
    ).toBeInTheDocument();
  });

  it('local pickup hides the postal address requirements (17)', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(screen.getByLabelText('CEP'), '66000000');
    await waitFor(() => expect(screen.getByLabelText('Cidade *')).toHaveValue('Belém'));

    await user.click(screen.getByRole('radio', { name: 'retirada' }));
    expect(screen.queryByLabelText('CEP')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'entrega' }));
    expect(screen.getByLabelText('Cidade *')).toHaveValue('Belém');
  });
});
