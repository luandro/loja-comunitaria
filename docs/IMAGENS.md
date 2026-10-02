# Imagens

A loja é feita para celulares simples e internet fraca. Fotos leves = loja rápida.

| tipo | tamanho máximo |
|---|---|
| Foto principal do produto | ~500 KB |
| Miniaturas / galeria | ~150 KB |
| Largura | ~1.600 px |
| Formato | WebP (JPEG serve; evite PNG em fotos) |

- Use sempre o mesmo formato: **quadrado (1:1)** ou **retrato (4:5)**.
- Luz natural, fundo liso, peça inteira.
- Nomes de arquivo sem acento nem espaço: `cesto-kraho-01.webp`.
- Reduza o tamanho em sites gratuitos como squoosh.app.

## Onde hospedar
A coluna `url_imagem` precisa de um **link direto** (termina em `.webp`, `.jpg`…). Opções:
- Pasta `public/imagens/` do próprio site → use `/imagens/cesto.webp`.
- Serviços de imagem com link direto (ex.: Cloudinary, ImgBB).
- Links de "compartilhar" do Google Drive normalmente **não** funcionam como link direto.

## Cuidados
- Não fotografe pessoas sem permissão, nem rituais, locais sagrados ou documentos.
- Remova a localização (GPS) das fotos antes de publicar.
- Se uma foto falhar, a loja mostra um espaço reservado — confira em `/verificar-loja`.
