# Loja Comunitária

Uma loja virtual simples para comunidades venderem artesanato. Você administra
tudo por uma **planilha do Google** — sem programação, sem servidor, sem banco de
dados. Os pedidos chegam pelo **WhatsApp** e a comunidade confirma cada um à mão.

> ## ⚠️ A planilha é PÚBLICA
> Qualquer pessoa com o link consegue ler **todas as abas**. Nunca coloque nela:
> - dados de clientes (nomes, telefones, endereços, pedidos);
> - custos internos, margens ou valores pagos a artesãos;
> - informações sensíveis da comunidade (locais sagrados, conflitos, documentos);
> - telefones pessoais ou anotações que não são para clientes.
>
> Detalhes em [docs/SEGURANCA_DA_PLANILHA.md](docs/SEGURANCA_DA_PLANILHA.md).

## Passo a passo para abrir sua loja

1. **Duplique a planilha modelo** — importe `docs/modelo-planilha/modelo-loja-comunitaria.xlsx` no Google Planilhas.
2. **Compartilhe só o necessário** — deixe a planilha como "Qualquer pessoa com o link: leitor" e mantenha nela apenas as abas da loja.
3. **Cadastre os produtos** na aba `Produtos`.
4. **Coloque nome, marca e contato** na aba `Conteudo_Site`.
5. **Copie o ID da planilha** (o trecho do endereço entre `/d/` e `/edit`).
6. **Configure a publicação** colando o ID em `VITE_GOOGLE_SPREADSHEET_ID`.
7. **Abra `/verificar-loja`** no seu site (ex.: `https://sualoja.com/verificar-loja`).
8. **Corrija o que aparecer** em amarelo ou vermelho.
9. **Publique a loja.**

Guia detalhado: [docs/CONFIGURAR_LOJA.md](docs/CONFIGURAR_LOJA.md).

## Configuração mínima

A menor loja que funciona precisa só disto:

**Arquivo de configuração (.env)**
```
VITE_GOOGLE_SPREADSHEET_ID="id-da-sua-planilha"
```

**Aba `Produtos`** (uma linha basta)

| id | nome | preco | url_imagem | descricao | tipo_estoque | quantidade_estoque |
|----|------|-------|------------|-----------|--------------|--------------------|
| 1 | Cesto de palha | 120.00 | https://…/cesto.webp | Cesto trançado à mão. | unique | 1 |

**Aba `Conteudo_Site`**

| chave | valor |
|-------|-------|
| nome_site | Loja da Aldeia |
| numero_whatsapp | 5563900000000 |

Pronto: a loja abre, mostra o produto e envia pedidos para o WhatsApp.

## Guias

| Assunto | Guia |
|---|---|
| Configurar a loja do zero | [CONFIGURAR_LOJA.md](docs/CONFIGURAR_LOJA.md) |
| Cadastrar e editar produtos (todas as colunas) | [GERENCIAR_PRODUTOS.md](docs/GERENCIAR_PRODUTOS.md) |
| Fotos leves e bonitas | [IMAGENS.md](docs/IMAGENS.md) |
| Como os pedidos chegam | [PEDIDOS_E_WHATSAPP.md](docs/PEDIDOS_E_WHATSAPP.md) |
| Pix (opcional) | [PIX.md](docs/PIX.md) |
| Colocar o site no ar | [PUBLICAR.md](docs/PUBLICAR.md) |
| Segurança da planilha | [SEGURANCA_DA_PLANILHA.md](docs/SEGURANCA_DA_PLANILHA.md) |

## O que a loja já faz

- Funciona em celulares simples e internet fraca; guarda o catálogo para ver sem internet.
- Busca e filtros por categoria, comunidade e disponibilidade.
- Busca de endereço pelo CEP.
- Página de cada comunidade (opcional).
- Se a planilha falhar, mostra o último catálogo bom e avisa.

## Para quem desenvolve

React + Vite + TypeScript, site 100% estático. `npm i`, `cp .env.example .env`,
`npm run dev`. Testes: `npx vitest run`. Princípios em `PROJECT_PRINCIPLES.md`.
