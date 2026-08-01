# Princípios do Projeto — Loja Comunitária

> "Uma loja comunitária simples, gerenciada por planilha, que transforma um catálogo em
> pedidos pelo WhatsApp — sem mensalidade, painel complexo ou servidor próprio."

## 1. Estática e sem servidor

A loja é uma aplicação React/Vite 100% client-side, publicada como arquivos estáticos.
Não há banco de dados, autenticação, backend próprio nem funções de servidor.

## 2. Pedidos são solicitações, não transações confirmadas

Finalizar o carrinho gera uma **solicitação de pedido** enviada por WhatsApp.
Nada é cobrado, reservado ou confirmado automaticamente — a confirmação é sempre humana.

## 3. Estoque é informativo

As quantidades vindas da planilha são uma referência aproximada e estão sujeitas a
confirmação pela comunidade no atendimento.

## 4. A planilha contém apenas dados públicos de vitrine

O Google Sheets guarda catálogo e conteúdo do site (nomes, preços, imagens, textos,
contatos). Nunca deve conter dados pessoais de clientes, pedidos ou segredos.

## 5. WhatsApp é o canal operacional

Todo o fluxo de pedido, dúvida, combinação de pagamento e entrega acontece no WhatsApp
da comunidade. O Pix (quando usado) é gerado no navegador, sem intermediários.

## 6. Configurável sem editar código

Uma comunidade deve conseguir clonar o projeto, apontar as variáveis de ambiente para
a sua planilha e o seu WhatsApp, e publicar — sem tocar em código e sem contratar
serviços pagos para a operação básica.
