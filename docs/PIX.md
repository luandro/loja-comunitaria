# Pix (opcional)

A loja envia pedidos pelo WhatsApp. O Pix pode aparecer no checkout se a comunidade quiser — tudo gerado no navegador do cliente, sem backend e sem verificação de pagamento.

## Como funciona o checkout

1. O cliente monta o pedido e informa entrega/retirada, endereço mínimo e nome.
2. Se o Pix estiver configurado e o valor for conhecido, o QR Code e o código "copia e cola" aparecem **automaticamente** — sem botão extra.
3. O cliente paga no app do banco, volta e toca em **"Já paguei — enviar pedido"**.
4. O WhatsApp abre com o pedido pronto; o cliente anexa o comprovante e envia.
5. A comunidade confere o pagamento no banco e confirma o pedido manualmente.

> "Já paguei" é apenas uma declaração do cliente. A loja **não** verifica pagamento, **não** reserva peça e **não** confirma pedido automaticamente.

## Configurar (aba `Conteudo_Site`)

| chave | o que é |
|---|---|
| `ativar_pix` | `sim` para habilitar o Pix. |
| `chave_pix` | Chave Pix **da loja/associação** (prefira CNPJ, e-mail ou chave aleatória — evite CPF pessoal). |
| `nome_recebedor_pix` | Nome do recebedor, como no banco. |
| `cidade_recebedor_pix` | Cidade do recebedor. |
| `instrucao_pix` | Texto de orientação (opcional). |
| `pix_automatico` | `TRUE` (padrão, pode deixar vazio): o Pix aparece sozinho no checkout. `FALSE`: o checkout pula o Pix e envia o pedido direto pelo WhatsApp. |
| `frete_separado` | `true` somente se a loja **sempre** combina o frete à parte. Nesse caso o Pix da entrega cobra só os produtos e a mensagem avisa "Frete será combinado separadamente". |

## Frete e valor do Pix

O Pix nunca cobra um valor que a loja não conhece:

- **Retirada**: o valor é o total dos produtos → Pix aparece normalmente.
- **Entrega sem `frete_separado`** (padrão): o frete ainda é desconhecido, então o checkout **não mostra Pix** e envia o pedido pelo WhatsApp. A loja confirma frete e pagamento manualmente.
- **Entrega com `frete_separado = true`**: o Pix cobra apenas os produtos, com o aviso de frete à parte.

## Se a configuração estiver incompleta

O checkout nunca mostra um QR quebrado: ele simplesmente envia o pedido pelo WhatsApp com o aviso "O pagamento será combinado pelo WhatsApp." O problema real aparece em `/verificar-loja`.

> ⚠️ A chave Pix fica visível na planilha pública e no site. Use só uma chave criada para a loja.

Confira em `/verificar-loja` se a configuração está completa.
