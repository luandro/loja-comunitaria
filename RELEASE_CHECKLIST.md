# Checklist de mise en production — Loja Comunitária

À parcourir avant chaque publication. La page `/verificar-loja` automatise une grande partie de ces contrôles : l'ouvrir en premier.

## 1. Configuration

- [ ] `.env` rempli à partir de `.env.example` : `VITE_GOOGLE_SPREADSHEET_ID` (obligatoire), `VITE_GOOGLE_SPREADSHEET_TAB` (`Produtos`), `VITE_GOOGLE_SPREADSHEET_CONTENT_TAB` (`Conteudo_Site`).
- [ ] Le bandeau de diagnostic orange n'apparaît pas en haut du site (s'il apparaît, lire chaque ligne et corriger).
- [ ] `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` passent sans erreur.
- [ ] Aucune clé privée, mot de passe ou coût interne n'est présent dans le code, la planilha ou les documents publics.

## 2. Planilha

- [ ] Le partage de la planilha est « Toute personne disposant du lien peut consulter » (obligatoire pour que le site la lise).
- [ ] La planilha ne contient QUE les onglets de la boutique (Produtos, Conteudo_Site, Categorias, Comunidades, LEIA-ME) — jamais de données clients, coûts, numéros privés ou notes internes.
- [ ] Chaque produit a : `id` unique, `nome`, `preco`, `url_imagem`, `tipo_estoque` (`unique` / `limited` / `made_to_order`).
- [ ] `quantidade_estoque` cohérente : `unique` = 1, `limited` = nombre réel, 0 = esgotado.
- [ ] Aucune valeur d'exemple restante (images `exemplo.org`, WhatsApp `5511900000000`, textes « Troque por… »).
- [ ] Onglet Conteudo_Site : `site_name`, `whatsapp_number` (format international, chiffres seuls), `site_tagline` remplis.
- [ ] `/verificar-loja` : toutes les lignes au vert ; corriger celles signalées puis « Atualizar ».

## 3. Mobile

- [ ] Tester sur un vrai téléphone d'entrée de gamme (ou mode mobile du navigateur).
- [ ] Menu de navigation tactile : boutons assez grands, tout accessible au pouce.
- [ ] Le catalogue charge progressivement (skeleton puis images), pas d'écran blanc.
- [ ] Les images ne se chargent pas toutes d'un coup (défilement progressif).

## 4. Flux de pedido

- [ ] Ajouter un produit au panier, ouvrir `/carrinho` : la référence `LC-XXXXXX` s'affiche.
- [ ] Peça única : impossible de dépasser 1 unité ; badge « Peça única » visible.
- [ ] Remplir le formulaire (Nome, Telefone, CEP, Cidade, Estado, Entrega, Observações) : le CEP remplit la ville automatiquement.
- [ ] « Solicitar pedido » ouvre WhatsApp avec le message structuré (produits, total, blocs DADOS/ENTREGA, référence).
- [ ] Le site n'affiche jamais « commande confirmée » : la disponibilidade, le fret et le paiement sont confirmés manuellement par la boutique.
- [ ] Le panier n'est pas vidé automatiquement après l'envoi.

## 5. Pix (optionnel)

- [ ] Si `pix_enabled = sim` : `pix_key`, `pix_recipient_name`, `pix_recipient_city` sont remplis — sinon le panneau Pix reste caché.
- [ ] Le QR s'affiche dans le panier uniquement en mode `pix_immediate` et le bouton « copiar código » fonctionne.
- [ ] L'avertissement est visible : le paiement Pix ne réserve pas le produit et ne confirme pas le pedido.

## 6. Accessibilité

- [ ] Navigation complète au clavier (Tab) : focus visible sur chaque élément.
- [ ] Lien « Aller au contenu » en haut de page.
- [ ] Les badges d'inventaire portent une icône + un mot (jamais la couleur seule).
- [ ] Contraste lisible des textes sur fond sable/terre cuite.

## 7. Hors ligne

- [ ] Couper le réseau : le bandeau hors ligne apparaît et le dernier catalogue connu reste consultable.
- [ ] Rétablir le réseau : le catalogue se met à jour et l'heure de dernière mise à jour est affichée.

## 8. Publicação

- [ ] Hébergement statique configuré avec fallback SPA (Lovable le fait automatiquement ; `public/_redirects` fourni pour Netlify, `vercel.json` pour Vercel).
- [ ] Liens profonds testés : ouvrir directement `/produto/<slug>`, `/produto/<id>` et `/comunidade/<slug>` sans erreur 404.
- [ ] `robots.txt` et `sitemap.xml` accessibles ; titre et description de la boutique corrects dans le partage de lien.
- [ ] Publier sur Lovable (bouton Publish → Update) ou déployer sur l'hôte statique choisi.
