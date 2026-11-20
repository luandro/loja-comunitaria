# Roadmap — Checkout simplificado (Pix automático + WhatsApp)

- [x] Config: `pix_automatico` (padrão ON) e `frete_separado` no site-content/store
- [x] `src/lib/checkout.ts`: dados, validação amigável, elegibilidade Pix, mensagens WhatsApp, persistência local
- [x] i18n: novas chaves pt-BR/en do checkout
- [x] UI: Cart.tsx em coluna única progressiva; DeliveryChoice; AddressSection (CEP primeiro); PixPanel reescrito; removidos OrderRequestForm/OrderSummary
- [x] /verificar-loja: expor status do pix_automatico
- [x] Testes: checkout.test.ts (flags, Pix, frete, mensagens, persistência); CartContext (persistência refresh/app switch)
- [x] Docs: PIX.md, CONFIGURAR_LOJA.md, modelo Conteudo_Site.csv + xlsx regerado
- [x] Verificar: tsgo, eslint, vitest (86 passam), build OK, review mobile 390px (Playwright)
- [x] Read spreadsheet directly from Google CSV (OpenSheet only as backup)
- [x] Checkout microcopy: freight explainer + Pix receipt reminder
