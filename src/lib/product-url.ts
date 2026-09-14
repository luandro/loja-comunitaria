import { slugify } from './communities';
import type { Product } from './products';

/**
 * Product URLs prefer the spreadsheet slug and fall back to the numeric id.
 * Old numeric links keep working forever: lookup accepts both forms.
 */
export function productSlug(product: Pick<Product, 'id' | 'slug' | 'name'>): string {
  const slug = product.slug ? slugify(product.slug) : '';
  return slug || String(product.id);
}

export function productPath(product: Pick<Product, 'id' | 'slug' | 'name'>): string {
  return `/produto/${productSlug(product)}`;
}

/** Find a product by slug or numeric id (URL param). */
export function findProductByParam(
  products: Product[],
  param: string | undefined,
): Product | undefined {
  if (!param) return undefined;
  const normalized = slugify(param);
  const numeric = Number(param);
  return (
    products.find((p) => p.slug && slugify(p.slug) === normalized) ||
    (Number.isFinite(numeric) ? products.find((p) => p.id === numeric) : undefined) ||
    products.find((p) => slugify(p.name) === normalized)
  );
}
