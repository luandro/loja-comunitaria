# Pix (opcional)

Por padrão a loja só envia pedidos pelo WhatsApp. O Pix pode ser ligado se a comunidade quiser.

## O que a loja faz
- Gera o QR Code e o código "copia e cola" **no próprio celular do cliente**.
- **Não** verifica pagamento, **não** reserva peça e **não** confirma pedido.
- O cliente envia o comprovante pelo WhatsApp; a comunidade confere no banco.

## Configurar (aba `Conteudo_Site`)
| chave | o que é |
|---|---|
| `ativar_pix` | `sim` para ligar. |
| `chave_pix` | Chave Pix **da loja/associação** (prefira CNPJ, e-mail ou chave aleatória — evite CPF pessoal). |
| `nome_recebedor_pix` | Nome do recebedor, como no banco. |
| `cidade_recebedor_pix` | Cidade do recebedor. |
| `instrucao_pix` | Texto de orientação. |
| `aviso_confirmacao_pix` | Aviso de que o pedido só vale após confirmação. |
| `url_qr_pix` | (opcional) Imagem de QR fixo gerada pelo banco. |
| `modo_checkout` | `whatsapp_first` (padrão): Pix combinado depois. `pix_immediate`: mostra o Pix logo no carrinho. |

Recomendação: mantenha `whatsapp_first`, confirmando disponibilidade antes de receber.

> ⚠️ A chave Pix fica visível na planilha pública e no site. Use só uma chave criada para a loja.

Confira em `/verificar-loja` se a configuração está completa.
