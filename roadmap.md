# Roadmap — Checkout simplificado (Pix automático + WhatsApp)

- [ ] Config: `pix_automatico` (padrão ON) e `frete_separado` no site-content/store
- [ ] `src/lib/checkout.ts`: dados, validação amigável, elegibilidade Pix, mensagens WhatsApp, persistência local
- [ ] i18n: novas chaves pt-BR/en do checkout
- [ ] UI: Cart.tsx em coluna única progressiva; DeliveryChoice; AddressSection (CEP primeiro); PixPanel reescrito; remover OrderRequestForm/OrderSummary
- [ ] /verificar-loja: expor status do pix_automatico
- [ ] Testes: checkout.test.ts (flags, Pix, frete, mensagens, persistência); atualizar/remover testes antigos
- [ ] Docs: PIX.md, CONFIGURAR_LOJA.md, modelo Conteudo_Site.csv
- [ ] Verificar: tsgo, eslint, vitest, build, review mobile (Playwright)
