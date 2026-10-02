# Pedidos e WhatsApp

A loja **não cobra nem confirma compras sozinha**. Ela envia uma **solicitação de pedido** pelo WhatsApp, e a comunidade confirma à mão.

## Como funciona
1. O cliente monta o carrinho e clica em **Solicitar pedido**.
2. Preenche nome, telefone, CEP, cidade, estado, entrega ou retirada e observações.
3. O WhatsApp abre com uma mensagem pronta e um código como **LC-A1B2C3**.
4. A comunidade responde: confirma disponibilidade, frete, forma de pagamento.
5. O carrinho do cliente não é esvaziado automaticamente.

## Configurar
Na aba `Conteudo_Site`:
- `numero_whatsapp`: só números, com 55 + DDD. Ex.: `5563900000000`.
- `mensagem_whatsapp`: mensagem do botão flutuante.
- `aviso_pedido`, `politica_envio`, `retirada_disponivel`: avisos no carrinho.

Sem número configurado, os botões de WhatsApp ficam escondidos e `/verificar-loja` avisa.

## Boas práticas
- Use um número **da loja** (de preferência WhatsApp Business), nunca um telefone pessoal privado.
- Guarde os pedidos **fora** da planilha pública (no próprio WhatsApp ou numa planilha privada).
- Use o código LC-XXXXXX para se referir ao pedido.
- Depois de vendido, atualize o estoque na aba `Produtos`.
