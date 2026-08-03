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
confirmação pela comunidade no atendimento. Adicionar ao carrinho **não reserva** nada.

### Estrutura recomendada de estoque na planilha (aba `Produtos`)

| Coluna (EN / PT-BR)                    | Uso |
| -------------------------------------- | --- |
| `inventory_type` / `tipo_estoque`      | `unique`, `limited`, `made_to_order` ou `available` |
| `stock_quantity` / `quantidade_estoque`| Quantidade reportada (obrigatória para `unique` e `limited`) |
| `production_time` / `prazo_producao`   | Prazo estimado, usado em `made_to_order` (ex.: `15 a 20 dias`) |

Interpretação:

- `unique` + estoque `1` → peça única reportada como disponível.
- `unique` + estoque `0` → vendida/indisponível (nunca aparece como disponível).
- `limited` → usa `stock_quantity`; `0` significa esgotado.
- `made_to_order` → sem quantidade; mostra o prazo de produção.
- `available` → disponível em geral, sem contagem exata.

Compatibilidade: planilhas antigas com apenas `quantity` continuam carregando —
o app aplica um fallback seguro (número de estoque vira `limited`, sem estoque vira
`available`/`made_to_order`) e registra um aviso no console pedindo a nova coluna.

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
