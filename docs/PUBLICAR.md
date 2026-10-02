# Publicar a loja

O site é estático: não precisa de servidor nem banco de dados. Só precisa saber o ID da planilha.

## Opção A — Lovable (mais simples)
1. Abra o projeto no Lovable (ou faça uma cópia com **Remix**).
2. Peça no chat: "Use o ID de planilha `SEU_ID`" — ou edite `VITE_GOOGLE_SPREADSHEET_ID` no arquivo `.env`.
3. Clique em **Publish** (Publicar). O site fica em `https://nome.lovable.app`.
4. Abra `https://nome.lovable.app/verificar-loja` e confira.
5. Domínio próprio: **Settings → Domains**.

Mudanças na planilha aparecem sozinhas, sem publicar de novo. Só publique de novo se mudar o ID.

## Opção B — Netlify (independente e gratuito)
1. Crie conta em netlify.com e conecte o repositório do GitHub do projeto.
2. Configurações de build:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Site configuration → Environment variables** → adicione `VITE_GOOGLE_SPREADSHEET_ID` com o ID.
4. **Deploy**. Abra `/verificar-loja`.

O arquivo `public/_redirects` já faz links diretos como `/produto/cesto` funcionarem.

## Outras opções
- **Vercel**: igual à Netlify (build `npm run build`, pasta `dist`, mesma variável). `vercel.json` já incluso.
- **Cloudflare Pages**: igual; usa o mesmo `_redirects`.
- **GitHub Pages**: depois do build, copie `dist/index.html` para `dist/404.html`.

## Depois de publicar
- Teste um pedido de ponta a ponta pelo WhatsApp.
- Abra o site no celular e use "Adicionar à tela inicial".
- Pré-visualizações de link no WhatsApp mostram só nome e descrição gerais da loja.
