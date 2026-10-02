# Gerenciar produtos (aba `Produtos`)

Cada linha é uma peça. A primeira linha tem os nomes das colunas — não mude.
Colunas podem estar em qualquer ordem; colunas opcionais podem ser apagadas.
Nomes em inglês (entre parênteses) também funcionam.

> ⚠️ Esta aba é pública. Não coloque custo, valor pago ao artesão, telefone pessoal ou anotações internas.

## Obrigatórias
| coluna | o que é | exemplo |
|---|---|---|
| `id` (`id`) | Número único da peça. Nunca reutilize. | `12` |
| `nome` (`name`) | Nome da peça. | `Cesto Krahô` |
| `preco` (`price`) | Preço em reais, **com ponto**. | `120.00` |
| `url_imagem` (`image`) | Link direto da foto. Ver [IMAGENS.md](IMAGENS.md). | `https://…/cesto.webp` |
| `descricao` (`description`) | Descrição curta (1–2 frases). | |

## Estoque
| coluna | o que é |
|---|---|
| `tipo_estoque` (`inventory_type`) | `unique` = peça única; `limited` = poucas unidades; `made_to_order` = feito sob encomenda; `available` = sempre disponível. |
| `quantidade_estoque` (`stock_quantity`) | Quantas existem. `0` = **Esgotado**. Para `unique`, use `1`. |
| `prazo_producao` (`production_time`) | Para encomendas, ex.: `15 dias`. |

Selos exibidos: Peça única, Última unidade, Poucas unidades, Feito sob encomenda, Disponível, Esgotado. Peça única só entra uma vez no carrinho.

## Exibição
| coluna | o que é |
|---|---|
| `ativo` (`active`) | `nao` esconde a peça. Vazio = aparece. |
| `destaque` (`featured`) | `sim` mostra na página inicial. |
| `ordem` (`sort_order`) | Número para ordenar (menor primeiro). |
| `categoria` (`category`) | Use os nomes da aba `Categorias`. |
| `slug` | Endereço da peça (`/produto/cesto-kraho`). Sem acento nem espaço; único. Vazio = usa o número. |

## Origem (só o que a comunidade aprovar)
| coluna | o que é |
|---|---|
| `povo_ou_comunidade` | Nome do povo ou comunidade. |
| `slug_comunidade` | Liga à página da aba `Comunidades`. |
| `nome_artesao` | Só com permissão da pessoa. |
| `local_de_origem` | Região geral, nunca endereço. |

## Detalhes da peça
| coluna | o que é |
|---|---|
| `detalhes` (`longDescription`) | Descrição longa na página da peça. |
| `materiais` | Ex.: `palha de buriti, sementes`. |
| `tecnica` | Técnica de produção. |
| `dimensoes` | Ex.: `30 x 20 cm`. |
| `peso_gramas` | Número, ex.: `400`. |
| `instrucoes_de_cuidado` | Como conservar. |
| `destino_da_renda` | Para onde vai o dinheiro (texto público). |
| `observacoes_envio` | Cuidados no envio. |
| `urls_galeria_imagens` | Mais fotos, links separados por vírgula. |

## Buscadores
| coluna | o que é |
|---|---|
| `titulo_seo` | Título no Google. Vazio = usa o nome. |
| `descricao_seo` | Descrição no Google. Vazio = usa a descrição. |

## Dúvidas comuns
- **Vendeu?** Mude `quantidade_estoque` para `0` (fica "Esgotado") ou `ativo` para `nao`.
- **Não apareceu?** Espere alguns minutos, clique em **Atualizar catálogo** e confira `/verificar-loja`.
- **Não invente** descrições culturais: escreva só o que a comunidade aprovou. Campo vazio fica escondido.
