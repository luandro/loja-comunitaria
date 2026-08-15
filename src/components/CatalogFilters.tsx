import { useState } from 'react';
import type { Store } from '@/lib/store';
import type { TranslationKey } from '@/lib/i18n';
import {
  SORT_OPTIONS,
  type CatalogFilterState,
  type InventoryFilter,
  type SortOption,
} from '@/lib/catalog';

interface Props {
  store: Store;
  filters: CatalogFilterState;
  onChange: (patch: Partial<CatalogFilterState>) => void;
  onClear: () => void;
  categories: string[];
  communities: string[];
  inventoryChoices: InventoryFilter[];
  resultCount: number;
}

const selectClass =
  'w-full px-3 py-2 border border-sand-200 rounded-md bg-white text-forest-900 focus:outline-none focus:ring-2 focus:ring-terra-500';

export const CatalogFilters = ({
  store,
  filters,
  onChange,
  onClear,
  categories,
  communities,
  inventoryChoices,
  resultCount,
}: Props) => {
  const [open, setOpen] = useState(false);

  const chips: { key: string; label: string; clear: Partial<CatalogFilterState> }[] = [];
  if (filters.query)
    chips.push({ key: 'query', label: `“${filters.query}”`, clear: { query: '' } });
  if (filters.category)
    chips.push({ key: 'category', label: filters.category, clear: { category: '' } });
  if (filters.community)
    chips.push({ key: 'community', label: filters.community, clear: { community: '' } });
  if (filters.inventory !== 'all')
    chips.push({
      key: 'inventory',
      label: store.t(`inv_${filters.inventory}` as TranslationKey),
      clear: { inventory: 'all' },
    });

  const countLabel =
    resultCount === 1
      ? store.t('results_count_one')
      : store.t('results_count_many').replace('{count}', String(resultCount));

  const hasFacets =
    categories.length > 0 || communities.length > 0 || inventoryChoices.length > 0;

  return (
    <section className="mb-8" aria-label={store.t('filters_title')}>
      <div className="max-w-3xl mx-auto">
        <label htmlFor="product-search" className="sr-only">
          {store.t('search_label')}
        </label>
        <input
          id="product-search"
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
          placeholder={store.text('search_placeholder', 'search_placeholder')}
          className={selectClass}
        />

        {hasFacets && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="catalog-filters-panel"
            className="md:hidden mt-3 w-full px-4 py-2 border border-sand-200 rounded-md text-forest-800 bg-sand-100"
          >
            {store.t('filters_title')}
            {chips.length > 0 ? ` (${chips.length})` : ''}
          </button>
        )}

        <div
          id="catalog-filters-panel"
          className={`${open ? 'grid' : 'hidden'} md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3`}
        >
          {categories.length > 0 && (
            <div>
              <label htmlFor="filter-category" className="block text-sm text-forest-700 mb-1">
                {store.t('filter_category')}
              </label>
              <select
                id="filter-category"
                className={selectClass}
                value={filters.category}
                onChange={(e) => onChange({ category: e.target.value })}
              >
                <option value="">{store.t('filter_all_option')}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {communities.length > 0 && (
            <div>
              <label htmlFor="filter-community" className="block text-sm text-forest-700 mb-1">
                {store.t('filter_community')}
              </label>
              <select
                id="filter-community"
                className={selectClass}
                value={filters.community}
                onChange={(e) => onChange({ community: e.target.value })}
              >
                <option value="">{store.t('filter_all_option')}</option>
                {communities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {inventoryChoices.length > 0 && (
            <div>
              <label htmlFor="filter-inventory" className="block text-sm text-forest-700 mb-1">
                {store.t('filter_inventory')}
              </label>
              <select
                id="filter-inventory"
                className={selectClass}
                value={filters.inventory}
                onChange={(e) => onChange({ inventory: e.target.value as InventoryFilter })}
              >
                {inventoryChoices.map((option) => (
                  <option key={option} value={option}>
                    {store.t(`inv_${option}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="filter-sort" className="block text-sm text-forest-700 mb-1">
              {store.t('filter_sort')}
            </label>
            <select
              id="filter-sort"
              className={selectClass}
              value={filters.sort}
              onChange={(e) => onChange({ sort: e.target.value as SortOption })}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {store.t(`sort_${option}` as TranslationKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <p className="text-sm text-forest-700" aria-live="polite">
            {countLabel}
          </p>
          {chips.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label={store.t('active_filters_label')}>
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    onClick={() => onChange(chip.clear)}
                    className="inline-flex items-center gap-1 rounded-full bg-sand-200 text-forest-800 px-3 py-1 text-xs"
                    aria-label={`${store.t('remove_filter')}: ${chip.label}`}
                  >
                    {chip.label}
                    <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={onClear}
                  className="text-xs underline text-terra-600 px-2 py-1"
                >
                  {store.t('clear_filters')}
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default CatalogFilters;
