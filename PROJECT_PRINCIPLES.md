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

## 7. Consulta de CEP: ajuda no preenchimento, não validação

O formulário de solicitação consulta o CEP direto no navegador, na **BrasilAPI**
(`https://brasilapi.com.br/api/cep/v1/{cep}`).

O que a comunidade precisa saber:

- O preenchimento automático é **assistência opcional**, não validação de endereço.
- Todos os campos retornados continuam **editáveis** pelo cliente.
- CEPs rurais, ribeirinhos, indígenas e de comunidades podem retornar apenas
  cidade/UF — isso é um resultado **parcial válido**, não um erro.
- Endereços sem rua, bairro ou número são aceitos (há a opção “Sem número” / `S/N`
  e o campo “Ponto de referência”).
- Se o serviço estiver fora do ar ou o cliente estiver offline, a loja continua
  funcionando: o endereço é preenchido manualmente e o pedido segue normalmente.
- O provedor recebe **apenas o CEP** — nunca nome, telefone, número, complemento
  ou o conteúdo do pedido.
- **Nenhuma chave de API e nenhum backend** são necessários.
- Resultados públicos de CEP ficam em cache local (até 50 CEPs, 30 dias); dados
  pessoais nunca são armazenados nesse cache.

### Chaves opcionais na aba `Conteudo_Site`

| Chave (EN / PT-BR) | Uso |
| --- | --- |
| `cep_lookup_enabled` / `consulta_cep_ativa` | `false` desliga a consulta (formulário segue manual) |
| `cep_lookup_privacy_notice` / `aviso_privacidade_cep` | Aviso exibido abaixo do campo CEP |
| `cep_lookup_loading_message` / `mensagem_carregando_cep` | Texto de carregamento |
| `cep_lookup_success_message` / `mensagem_sucesso_cep` | Sucesso |
| `cep_lookup_partial_message` / `mensagem_parcial_cep` | Resultado parcial |
| `cep_lookup_error_message` / `mensagem_erro_cep` | Falha de rede/provedor |
