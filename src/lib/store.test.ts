import { describe, it, expect } from 'vitest';
import { createStore } from './store';
import type { SiteContent } from './site-content';

const content = (over: Partial<SiteContent>): SiteContent =>
  ({ ...over } as unknown as SiteContent);

describe('formatPrice', () => {
  it('formate en BRL pt-BR', () => {
    const s = createStore(content({ whatsapp_number: '5511999999999' }));
    expect(s.formatPrice(120)).toContain('120');
    expect(s.formatPrice(120).replace(/ /g, ' ')).toMatch(/R\$/);
  });
});

describe('diagnostics — configuração de contato', () => {
  it('signale WhatsApp manquant', () => {
    const s = createStore(content({}));
    expect(s.diagnostics.some((d) => d.key === 'whatsapp')).toBe(true);
    expect(s.contact.hasAnyChannel).toBe(false);
  });
  it('pas de diagnostic WhatsApp quand le numéro est présent', () => {
    const s = createStore(content({ whatsapp_number: '5511999999999' }));
    expect(s.diagnostics.some((d) => d.key === 'whatsapp')).toBe(false);
    expect(s.contact.hasWhatsApp).toBe(true);
    expect(s.contact.whatsappLink).toContain('5511999999999');
  });
});

describe('Pix — configuração ausente', () => {
  it('Pix indisponible sans clé complète', () => {
    const s = createStore(
      content({ whatsapp_number: '5511999999999', pix_enabled: 'sim', pix_key: 'loja@x.com' }),
    );
    expect(s.pix.available).toBe(false);
    expect(s.pix.immediate).toBe(false);
  });
  it('Pix disponible seulement avec clé + nome + cidade', () => {
    const s = createStore(
      content({
        whatsapp_number: '5511999999999',
        pix_enabled: 'sim',
        pix_key: 'loja@x.com',
        pix_recipient_name: 'Loja',
        pix_recipient_city: 'Sao Paulo',
        checkout_mode: 'pix_immediate',
      }),
    );
    expect(s.pix.available).toBe(true);
    expect(s.pix.immediate).toBe(true);
  });
  it('checkout_mode whatsapp_first ne montre jamais le Pix immédiat', () => {
    const s = createStore(
      content({
        whatsapp_number: '5511999999999',
        pix_enabled: 'sim',
        pix_key: 'loja@x.com',
        pix_recipient_name: 'Loja',
        pix_recipient_city: 'Sao Paulo',
      }),
    );
    expect(s.checkoutMode).toBe('whatsapp_first');
    expect(s.pix.immediate).toBe(false);
  });
});
