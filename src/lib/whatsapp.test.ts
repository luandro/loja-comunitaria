import { describe, it, expect } from 'vitest';
import { getWhatsAppContactLink, getWhatsAppCustomLink, generateOrderId } from './whatsapp';

describe('links de contato WhatsApp', () => {
  it('constrói o link com o número e a mensagem codificada', () => {
    const link = getWhatsAppContactLink({ number: '5511999999999', message: 'Olá loja' });
    expect(link).toBe(
      `https://api.whatsapp.com/send?phone=5511999999999&text=${encodeURIComponent('Olá loja')}`,
    );
  });
  it('link customizado usa o número passado em priorité', () => {
    const link = getWhatsAppCustomLink('Pedido LC-ABC123', '5511888888888');
    expect(link).toContain('phone=5511888888888');
    expect(link).toContain(encodeURIComponent('Pedido LC-ABC123'));
  });
  it('código de pedido au format LC-XXXXXX', () => {
    expect(generateOrderId()).toMatch(/^LC-[A-Z0-9]{6}$/);
  });
});
