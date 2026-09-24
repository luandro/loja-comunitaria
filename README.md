# Loja Comunitária

## Project info

**URL**: https://lovable.dev/projects/565dc03d-d5a3-4f3d-aafc-14a8862644aa

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/565dc03d-d5a3-4f3d-aafc-14a8862644aa) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Create a .env file with your environment variables (use .env.example as a template)
cp .env.example .env
# Edit the .env file with your actual values

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Environment Variables

This project uses environment variables for configuration. Copy the `.env.example` file to `.env` and edit the values as needed:

```sh
cp .env.example .env
```

### Available Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `VITE_PIX_RECIPIENT_NAME` | Name of the PIX payment recipient | "Artes Indígenas" |
| `VITE_PIX_RECIPIENT_CITY` | City of the PIX payment recipient | "São Paulo" |
| `VITE_PIX_RECIPIENT_KEY` | PIX key for payments | "example@email.com" |
| `VITE_PIX_API_URL` | URL for the PIX API | "https://gerarqrcodepix.com.br/api/v1" |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number for order confirmation (format: country code + number) | "5511999999999" |
| `VITE_GOOGLE_SPREADSHEET_ID` | ID of Google Spreadsheet for product data (optional) | "" |
| `VITE_GOOGLE_SPREADSHEET_TAB` | Tab name in Google Spreadsheet for product data | "produtos" |

If these variables are not set, the application will use default values and log warnings to the console.

> **Note about PIX Integration**: Due to CORS limitations with third-party PIX API services, this application attempts to use the API directly but falls back to local generation if needed. For production use, we've included an example backend proxy implementation in `src/server/api/proxy-pix.ts` that would need to be deployed as a serverless function or Express endpoint to fully utilize the PIX API without CORS issues.

## Product Data Source

The product catalog can be managed through two different approaches:

1. **Local CSV File**: By default, the application loads products from `public/data/products.csv` if no Google Spreadsheet ID is provided. Edit this file to update your products.

2. **Google Spreadsheet Integration**: For easier management, you can connect the shop to a Google Spreadsheet by setting the environment variables:
   - `VITE_GOOGLE_SPREADSHEET_ID`: Your spreadsheet ID from the URL
   - `VITE_GOOGLE_SPREADSHEET_TAB`: The name of the tab/sheet containing product data (default: "produtos")

### Product Inventory Management

The application supports inventory tracking and handling of unique artisanal products:

- **Regular Products**: Products with a specified quantity will display the available inventory and prevent customers from adding more than the available quantity to their cart.
- **Unique Products**: Products with no quantity or a quantity of 0 are treated as unique artisanal pieces. These products have special styling (gold border and "ÚNICO" badge) and can only be added to the cart once.
- **Low Stock Warning**: Products with 3 or fewer items remaining show a yellow warning to encourage customers to make a purchase before stock runs out.
- **Out of Stock**: Products that have run out of stock are marked as "Esgotado" and can't be added to the cart.

### Google Spreadsheet Format

If using Google Spreadsheet, ensure your sheet has the following columns (in any order):
- `id`: Unique number identifier for each product
- `name`: Product name
- `price`: Price in BRL (use decimal point, not comma)
- `image`: URL to product image (can be absolute or relative to public folder)
- `description`: Short product description
- `longDescription`: Longer description shown on product details page (optional)
- `quantity`: Number of units available (optional)
  - If provided, the shop will track inventory and prevent ordering more than available
  - If empty or set to 0, the product will be treated as a unique piece with special styling

The sheet must be published to the web and accessible without authentication.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/565dc03d-d5a3-4f3d-aafc-14a8862644aa) and click on Share -> Publish.

Remember to set the environment variables in your hosting platform for PIX payments to work correctly in production.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

## Imagens dos produtos (guia rápido)

A loja é feita para funcionar em celulares simples e internet fraca. Ao subir fotos
na planilha, siga estes limites:

- **Miniaturas / imagens de lista:** até ~150 KB.
- **Imagem principal do produto:** até ~500 KB.
- **Formato preferido:** WebP (JPEG é aceitável; evite PNG para fotos).
- **Largura máxima:** cerca de 1.600 px.
- **Enquadramento:** use sempre o mesmo formato — quadrado (1:1) ou retrato (4:5) —
  para o catálogo ficar alinhado.
- Nomeie os arquivos sem acentos e use links diretos para a imagem.

Se uma imagem não carregar, o site mostra automaticamente um espaço reservado em vez
de quebrar a página.

## Funcionamento offline

O site guarda o último catálogo carregado no aparelho do visitante. Depois da primeira
visita, é possível navegar pelo catálogo, ver produtos e montar o carrinho sem internet.
Só é preciso conexão para abrir o WhatsApp ou links externos. Um aviso aparece no topo
quando o aparelho está sem conexão. O site também pode ser instalado na tela inicial do
celular.

## Hospedagem estática e links diretos

O site é 100% estático (sem servidor). Endereços diretos como
`/produto/cesto-krahô` precisam que o host devolva o `index.html` para qualquer
rota. Já deixamos os arquivos prontos:

- **Lovable** e **Netlify**: `public/_redirects` com `/* /index.html 200`.
- **Vercel**: `vercel.json` com rewrite de `/(.*)` para `/index.html`.
- **Cloudflare Pages**: usa o mesmo `public/_redirects`.
- **GitHub Pages**: não tem reescrita própria; copie o `index.html` publicado
  como `404.html` na pasta publicada (`cp dist/index.html dist/404.html`).

### Endereços dos produtos

Se a planilha tiver a coluna `slug`, o endereço usa o nome
(`/produto/cesto-krahô`). Sem `slug`, continua usando o número
(`/produto/12`). Links antigos com número seguem funcionando para sempre.

## SEO: o que é possível sem servidor

- `index.html`, `robots.txt` e `sitemap.xml` (gerado na build a partir de
  `public/data/products.csv`) são estáticos e lidos por qualquer buscador.
- Título, descrição, canonical, Open Graph e os dados estruturados de produto e
  comunidade são aplicados **no navegador**, porque o catálogo vem da planilha
  do Google só quando a página abre. Buscadores que executam JavaScript (Google)
  leem esse conteúdo; pré-visualizações de links (WhatsApp, Facebook, LinkedIn)
  veem apenas as informações fixas do `index.html`. Para prévias por produto
  seria necessário renderização no servidor, o que este projeto não usa.
- A planilha pode informar `seo_title` e `seo_description` por produto; quando
  vazios, usamos nome e descrição.
