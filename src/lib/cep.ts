/**
 * Client-side Brazilian CEP lookup.
 *
 * 100% static: talks directly to the public BrasilAPI endpoint from the browser.
 * No backend, no API key, no personal data leaves the app — only the CEP itself.
 */

export interface AddressLookupResult {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  provider: 'brasilapi';
}

export type CepLookupErrorKind = 'invalid' | 'not_found' | 'network' | 'timeout' | 'aborted';

export class CepLookupError extends Error {
  kind: CepLookupErrorKind;
  constructor(kind: CepLookupErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'CepLookupError';
    this.kind = kind;
  }
}

/** Strip everything that is not a digit and cap at 8 characters. */
export function normalizeCep(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '').slice(0, 8);
}

/** Visual mask 00000-000 (partial input is masked progressively). */
export function formatCep(value: string | null | undefined): string {
  const digits = normalizeCep(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function isValidCep(value: string | null | undefined): boolean {
  return normalizeCep(value).length === 8;
}

/* ------------------------------------------------------------------ */
/* Bounded, failure-safe local cache of PUBLIC cep → address data only */
/* ------------------------------------------------------------------ */

const CACHE_KEY = 'cepLookupCache';
const CACHE_MAX_ENTRIES = 50;
export const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface CacheEntry {
  result: AddressLookupResult;
  timestamp: number;
}

type CacheShape = Record<string, CacheEntry>;

function readCache(): CacheShape {
  try {
    const raw = globalThis.localStorage?.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as CacheShape) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: CacheShape): void {
  try {
    globalThis.localStorage?.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* storage unavailable — lookups still work */
  }
}

export function getCachedCep(cep: string): AddressLookupResult | null {
  const key = normalizeCep(cep);
  const entry = readCache()[key];
  if (!entry || typeof entry.timestamp !== 'number') return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
  return entry.result ?? null;
}

export function setCachedCep(result: AddressLookupResult): void {
  const cache = readCache();
  cache[result.cep] = { result, timestamp: Date.now() };
  const keys = Object.keys(cache);
  if (keys.length > CACHE_MAX_ENTRIES) {
    keys
      .sort((a, b) => (cache[a]?.timestamp ?? 0) - (cache[b]?.timestamp ?? 0))
      .slice(0, keys.length - CACHE_MAX_ENTRIES)
      .forEach((k) => delete cache[k]);
  }
  writeCache(cache);
}

export function clearCepCache(): void {
  try {
    globalThis.localStorage?.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Lookup                                                              */
/* ------------------------------------------------------------------ */

const ENDPOINT = 'https://brasilapi.com.br/api/cep/v1';
const TIMEOUT_MS = 9000;

const str = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

function normalizeResponse(cep: string, payload: unknown): AddressLookupResult {
  const data = (payload ?? {}) as Record<string, unknown>;
  return {
    cep,
    street: str(data.street),
    neighborhood: str(data.neighborhood),
    city: str(data.city),
    state: str(data.state).toUpperCase(),
    provider: 'brasilapi',
  };
}

/** True when the API returned city + state (address may still be partial). */
export function isUsableResult(result: AddressLookupResult): boolean {
  return result.city !== '' && result.state !== '';
}

/** True when street or neighborhood is missing — common in rural/community CEPs. */
export function isPartialResult(result: AddressLookupResult): boolean {
  return result.street === '' || result.neighborhood === '';
}

/** In-flight requests, deduplicated per CEP. */
const inflight = new Map<string, Promise<AddressLookupResult>>();

export async function lookupCep(
  value: string,
  signal?: AbortSignal,
): Promise<AddressLookupResult> {
  const cep = normalizeCep(value);
  if (cep.length !== 8) throw new CepLookupError('invalid');

  const cached = getCachedCep(cep);
  if (cached) return cached;

  const existing = inflight.get(cep);
  if (existing) return existing;

  const promise = (async () => {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort', onAbort);
    const timer = setTimeout(() => controller.abort('timeout'), TIMEOUT_MS);

    try {
      const res = await fetch(`${ENDPOINT}/${cep}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (res.status === 404) throw new CepLookupError('not_found');
      if (!res.ok) throw new CepLookupError('network', `HTTP ${res.status}`);

      const json = await res.json();
      const result = normalizeResponse(cep, json);
      if (!isUsableResult(result)) throw new CepLookupError('not_found');

      setCachedCep(result);
      return result;
    } catch (err) {
      if (err instanceof CepLookupError) throw err;
      if (signal?.aborted) throw new CepLookupError('aborted');
      if ((err as Error)?.name === 'AbortError') throw new CepLookupError('timeout');
      throw new CepLookupError('network', (err as Error)?.message);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      inflight.delete(cep);
    }
  })();

  inflight.set(cep, promise);
  return promise;
}
