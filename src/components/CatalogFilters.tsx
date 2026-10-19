import { useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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
  'w-full min-h-[44px] px-3 py-2 border border-sand-300 rounded-md bg-white text-forest-900 focus:outline-none focus:ring-2 focus:ring-ring';

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openSheet = () => dialogRef.current?.showModal();
  const closeSheet = () => dialogRef.current?.close();

  // Close the sheet if the viewport grows to desktop while it is open.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => mq.matches && closeSheet();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

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

  const filterCount = chips.filter((c) => c.key !== 'query').length;

  const hasFacets =
    categories.length > 0 || communities.length > 0 || inventoryChoices.length > 0;

  const renderFields = (prefix: string) => (
    <>
          {categories.length > 0 && (
            <div>
              <label htmlFor={`${prefix}-category`} className="block text-sm text-forest-700 mb-1">
                {store.t('filter_category')}
              </label>
              <select
                id={`${prefix}-category`}
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
              <label htmlFor={`${prefix}-community`} className="block text-sm text-forest-700 mb-1">
                {store.t('filter_community')}
              </label>
              <select
                id={`${prefix}-community`}
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
              <label htmlFor={`${prefix}-inventory`} className="block text-sm text-forest-700 mb-1">
                {store.t('filter_inventory')}
              </label>
              <select
                id={`${prefix}-inventory`}
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
            <label htmlFor={`${prefix}-sort`} className="block text-sm text-forest-700 mb-1">
              {store.t('filter_sort')}
            </label>
            <select
              id={`${prefix}-sort`}
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
            </>
  );

  return (
    <section className="mb-4" aria-label={store.t('filters_title')}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <label htmlFor="product-search" className="sr-only">
            {store.t('search_label')}
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-forest-600"
            aria-hidden="true"
          />
          <input
            id="product-search"
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder={store.text('search_placeholder', 'search_placeholder')}
            className={`${selectClass} h-12 pl-10 text-base`}
          />
        </div>
        {hasFacets && (<button
          type="button"
          onClick={openSheet}
          className="md:hidden inline-flex h-12 shrink-0 items-center gap-2 rounded-md border border-sand-300 bg-white px-3 text-sm font-medium text-forest-800"
          aria-haspopup="dialog"
        >
          <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
          {store.t('filters_title')}
          {filterCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-terra-600 px-1 text-xs font-bold text-white">
              {filterCount}
            </span>
          )}
        </button>)}
      </div>

      <div className="hidden md:grid grid-cols-4 gap-3 mt-3">{renderFields('filter')}</div>

      <dialog
        ref={dialogRef}
        aria-labelledby="filters-sheet-title"
        className="m-0 mt-auto w-full max-w-none rounded-t-2xl bg-sand-50 p-0 backdrop:bg-forest-900/50 md:hidden"
        onClick={(e) => e.target === e.currentTarget && closeSheet()}
      >
        <div className="flex items-center justify-between border-b border-sand-200 px-4 py-2">
          <h2 id="filters-sheet-title" className="font-sans text-lg font-semibold text-forest-900">
            {store.t('filters_title')}
          </h2>
          <button
            type="button"
            onClick={closeSheet}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-forest-800"
            aria-label={store.t('close_label')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-4 px-4 py-4">{renderFields('sheet')}</div>
        <div className="flex gap-2 border-t border-sand-200 px-4 py-3">
          {chips.length > 0 && (
            <button type="button" onClick={onClear} className="btn btn-secondary flex-1 px-3">
              {store.t('clear_filters')}
            </button>
          )}
          <button type="button" onClick={closeSheet} className="btn btn-primary flex-1 px-3">
            {store.t('filters_show_results')} ({resultCount})
          </button>
        </div>
      </dialog>

        <div className="flex flex-wrap items-center gap-2 mt-3">
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
                    className="inline-flex min-h-[32px] items-center gap-1 rounded-full border border-sand-300 bg-white text-forest-800 px-3 py-1 text-sm"
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
                  className="text-sm font-medium underline text-terra-700 px-2 py-1"
                >
                  {store.t('clear_filters')}
                </button>
              </li>
            </ul>
          )}
        </div>
    </section>
  );
};

export default CatalogFilters;
