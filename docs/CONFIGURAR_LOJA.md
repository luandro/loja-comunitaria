# Configurar a loja

Não é preciso saber programar. Você vai usar uma planilha do Google e o painel de publicação.

> ⚠️ **A planilha é pública.** Leia antes [SEGURANCA_DA_PLANILHA.md](SEGURANCA_DA_PLANILHA.md).

## 1. Duplicar a planilha
1. Baixe `docs/modelo-planilha/modelo-loja-comunitaria.xlsx`.
2. No Google Drive: **Novo → Upload de arquivo**, abra o arquivo e clique em **Abrir com Google Planilhas** (ou **Arquivo → Salvar como Planilhas Google**).
3. Confira as abas: `Produtos`, `Conteudo_Site`, `Categorias`, `Comunidades` (opcional) e `LEIA-ME`.
4. **Não renomeie as abas nem os títulos da primeira linha.**

Também há um `.csv` por aba na mesma pasta, se preferir importar uma por uma.

## 2. Publicar só as abas necessárias
A loja lê a planilha por um link público.
1. **Compartilhar → Acesso geral → Qualquer pessoa com o link → Leitor.**
2. Importante: com esse link, **todas as abas ficam legíveis**. Por isso a planilha da loja deve ter **somente** as abas acima. Controle de pedidos, clientes e custos fica em **outra planilha, privada**.

## 3. Adicionar produtos
Preencha a aba `Produtos`, uma peça por linha. Apague as linhas de exemplo. Veja [GERENCIAR_PRODUTOS.md](GERENCIAR_PRODUTOS.md).

## 4. Marca e contato
Preencha a coluna `valor` da aba `Conteudo_Site`. O mínimo é `nome_site` e `numero_whatsapp`. Lista completa abaixo.

## 5. Copiar o ID da planilha
No endereço `https://docs.google.com/spreadsheets/d/1AbC...xyz/edit#gid=0`, o ID é `1AbC...xyz`.

## 6. Configurar a publicação
Cole o ID em `VITE_GOOGLE_SPREADSHEET_ID`. Onde fazer isso depende de onde a loja fica: [PUBLICAR.md](PUBLICAR.md).

## 7. Abrir /verificar-loja
Acesse `https://endereco-da-loja/verificar-loja`. A página mostra:
- se a planilha de produtos e o conteúdo foram lidos;
- quantos produtos são válidos e quantas linhas foram ignoradas;
- IDs/slugs repetidos, preços inválidos, produtos sem imagem ou nome;
- tipo de estoque inválido, estoque zerado, textos de exemplo esquecidos;
- se nome da loja, WhatsApp e Pix estão configurados.

## 8. Corrigir problemas
Itens amarelos ou vermelhos dizem o que falta. Corrija na planilha, espere 1 a 5 minutos e clique em **Atualizar catálogo**.

## 9. Publicar
Veja [PUBLICAR.md](PUBLICAR.md).

---

## Todas as chaves da aba `Conteudo_Site`
A aba tem duas colunas: `chave` e `valor` (também aceita `key`/`value`). Uma terceira coluna "o que é" é só um lembrete. Valor vazio = a loja usa o padrão ou esconde a seção.

### Marca
| chave | o que é |
|---|---|
| `nome_site` | **Obrigatório.** Nome da loja. |
| `slogan_site` | Frase curta abaixo do nome. |
| `url_logo` | Link direto da imagem do logo. |
| `url_favicon` | Ícone da aba do navegador. |
| `url_imagem_og` | Imagem para compartilhamento. |

### Menu
| `rotulo_inicio`, `rotulo_produtos`, `rotulo_sobre`, `rotulo_contato`, `rotulo_carrinho` | Nomes dos itens do menu. |
|---|---|

### Cores (formato `#RRGGBB`)
| `cor_primaria`, `cor_secundaria`, `cor_destaque`, `cor_fundo`, `cor_areia` | Cores da loja. |
|---|---|

### Página inicial
| chave | o que é |
|---|---|
| `titulo_hero` | Título grande. |
| `descricao_hero` | Texto de apresentação. |
| `texto_botao_hero` | Texto do botão. |
| `url_imagem_hero` | Foto principal. |

### Catálogo
| chave | o que é |
|---|---|
| `titulo_produtos_destaque` | Título da seção de destaques. |
| `titulo_pagina_produtos` | Título da página de produtos. |
| `texto_botao_todos_produtos` | Botão "ver todos". |
| `placeholder_busca` | Texto dentro da busca. |
| `mensagem_catalogo_vazio` | Mensagem sem produtos. |
| `texto_adicionar_carrinho` | Botão de adicionar. |
| `texto_solicitar_pedido` | Botão de pedido. |
| `rotulo_estoque_singular` / `rotulo_estoque_plural` | Ex.: "unidade"/"unidades". |

### Sobre
| `titulo_sobre`, `texto_sobre`, `texto_botao_sobre`, `url_imagem_sobre`, `texto_missao`, `texto_valores`, `texto_compromisso` | Textos da página Sobre, escritos e aprovados pela comunidade. |
|---|---|

### Pedidos
| chave | o que é |
|---|---|
| `aviso_pedido` | Aviso no carrinho. |
| `aviso_estoque` | Aviso sobre disponibilidade. |
| `modo_checkout` | `whatsapp_first` (padrão) ou `pix_immediate`. |
| `instrucoes_checkout` | Instruções extras. |
| `politica_envio` | Como e para onde envia. |
| `retirada_disponivel` | `sim` ou `nao`. |

### Contato (só dados públicos da loja)
| chave | o que é |
|---|---|
| `numero_whatsapp` | **Obrigatório para pedidos.** Só números: 55 + DDD + número. |
| `mensagem_whatsapp` | Mensagem inicial do botão. |
| `email_contato` | E-mail público. |
| `localizacao` | Cidade/região (nunca endereço de pessoa). |
| `horario_atendimento` | Horário de atendimento. |
| `url_instagram`, `url_facebook` | Redes sociais. |

### Rodapé
| `nome_footer`, `slogan_footer`, `texto_copyright` | Textos do rodapé. |
|---|---|

### Idioma e moeda
| chave | padrão |
|---|---|
| `idioma_padrao` | `pt-BR` (ou `en`) |
| `moeda` | `BRL` |
| `local` | `pt-BR` |

### Pix (opcional) — veja [PIX.md](PIX.md)
`ativar_pix`, `chave_pix`, `nome_recebedor_pix`, `cidade_recebedor_pix`, `instrucao_pix`, `aviso_confirmacao_pix`, `url_qr_pix`.

### CEP
| chave | o que é |
|---|---|
| `consulta_cep_ativa` | `true` (padrão) ou `false`. |
| `aviso_privacidade_cep`, `mensagem_carregando_cep`, `mensagem_sucesso_cep`, `mensagem_parcial_cep`, `mensagem_erro_cep` | Mensagens da busca de CEP. |

### Buscadores
| `titulo_meta`, `descricao_meta` | Título e descrição no Google. |
|---|---|

## Aba `Categorias`
Lista de referência para escrever as categorias sempre igual. Colunas: `categoria` (nome exato usado em `Produtos`) e `descricao` (lembrete interno, mas também público). A loja monta os filtros a partir da coluna `categoria` dos produtos.

## Aba `Comunidades` (opcional)
Cria páginas em `/comunidade/identificador`. Sem essa aba a loja funciona normalmente.

| coluna | o que é |
|---|---|
| `slug` | Identificador no endereço, sem acento nem espaço (ex.: `aldeia-verde`). Se vazio, é gerado do nome. |
| `nome` | **Obrigatório.** Nome da comunidade ou povo. |
| `descricao` | Texto escrito e aprovado pela comunidade. |
| `localizacao` | Região geral — nunca endereço exato ou local sensível. |
| `url_imagem_hero` | Foto da página. |
| `numero_whatsapp` | WhatsApp **público** da comunidade. |
| `url_instagram`, `url_site`, `email` | Contatos públicos. |

Para ligar um produto à comunidade, use o mesmo `slug` na coluna `slug_comunidade` do produto.

## Aba `LEIA-ME`
Lembretes para quem edita. A loja não lê esta aba.
