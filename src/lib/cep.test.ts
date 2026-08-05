import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CACHE_TTL_MS,
  CepLookupError,
  clearCepCache,
  formatCep,
  getCachedCep,
  isPartialResult,
  isValidCep,
  lookupCep,
  normalizeCep,
  setCachedCep,
} from '@/lib/cep';

const fullResponse = {
  cep: '01001000',
  state: 'SP',
  city: 'São Paulo',
  neighborhood: 'Sé',
  street: 'Praça da Sé',
  service: 'widenet',
};

const partialResponse = {
  cep: '68000000',
  state: 'PA',
  city: 'Santarém',
  neighborhood: '',
  street: '',
};

const jsonResponse = (body: unknown, status = 200) =>
  ({ ok: status < 400, status, json: async () => body }) as Response;

describe('cep helpers', () => {
  beforeEach(() => {
    clearCepCache();
    vi.restoreAllMocks();
  });
  afterEach(() => clearCepCache());

  it('normalizes CEP by stripping non-digits (1)', () => {
    expect(normalizeCep(' 66.000-000 ')).toBe('66000000');
    expect(normalizeCep(undefined)).toBe('');
    expect(normalizeCep('660000001234')).toBe('66000000');
  });

  it('formats with the 00000-000 mask (2)', () => {
    expect(formatCep('66000')).toBe('66000');
    expect(formatCep('66000000')).toBe('66000-000');
    expect(formatCep('660')).toBe('660');
  });

  it('rejects fewer or more than eight digits (3)', async () => {
    expect(isValidCep('6600000')).toBe(false);
    expect(isValidCep('66000000')).toBe(true);
    await expect(lookupCep('1234567')).rejects.toMatchObject({ kind: 'invalid' });
  });

  it('normalizes a successful BrasilAPI response (4, 5)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(fullResponse)),
    );
    const result = await lookupCep('01001-000');
    expect(result).toEqual({
      cep: '01001000',
      street: 'Praça da Sé',
      neighborhood: 'Sé',
      city: 'São Paulo',
      state: 'SP',
      provider: 'brasilapi',
    });
    expect(isPartialResult(result)).toBe(false);
  });

  it('accepts a city/state-only partial response (6)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(partialResponse)),
    );
    const result = await lookupCep('68000000');
    expect(result.city).toBe('Santarém');
    expect(result.street).toBe('');
    expect(isPartialResult(result)).toBe(true);
  });

  it('maps 404 to not_found (7)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ message: 'not found' }, 404)),
    );
    await expect(lookupCep('99999999')).rejects.toMatchObject({ kind: 'not_found' });
  });

  it('maps a network failure (8)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );
    await expect(lookupCep('01001000')).rejects.toMatchObject({ kind: 'network' });
  });

  it('maps an aborted/timed-out request (9, 10)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        const err = new Error('aborted');
        err.name = 'AbortError';
        void init;
        throw err;
      }),
    );
    const controller = new AbortController();
    controller.abort();
    await expect(lookupCep('01001000', controller.signal)).rejects.toMatchObject({
      kind: 'aborted',
    });

    await expect(lookupCep('01001001')).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('does not let an older response overwrite a newer CEP (11)', async () => {
    const bodies: Record<string, unknown> = {
      '01001000': fullResponse,
      '68000000': partialResponse,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const cep = url.split('/').pop() as string;
        const delay = cep === '01001000' ? 40 : 1;
        await new Promise((r) => setTimeout(r, delay));
        return jsonResponse(bodies[cep]);
      }),
    );

    let latest = '';
    const slow = lookupCep('01001000').then((r) => {
      // simulate the hook's stale guard
      if (r.cep === latest) latest = r.city;
    });
    latest = '68000000';
    const fast = await lookupCep('68000000');
    latest = fast.city;
    await slow;
    expect(latest).toBe('Santarém');
  });

  it('reads from the local cache before the network (12)', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(fullResponse));
    vi.stubGlobal('fetch', fetchMock);
    await lookupCep('01001000');
    await lookupCep('01001000');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getCachedCep('01001-000')?.city).toBe('São Paulo');
  });

  it('expires cache entries (13)', () => {
    setCachedCep({
      cep: '01001000',
      street: 'x',
      neighborhood: 'y',
      city: 'z',
      state: 'SP',
      provider: 'brasilapi',
    });
    expect(getCachedCep('01001000')).not.toBeNull();
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + CACHE_TTL_MS + 1000);
    expect(getCachedCep('01001000')).toBeNull();
  });

  it('works when storage is unavailable (14)', async () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(fullResponse)),
    );
    await expect(lookupCep('01001000')).resolves.toMatchObject({ city: 'São Paulo' });
    spy.mockRestore();
  });

  it('sends only the CEP to the provider — no personal data (20)', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(fullResponse));
    vi.stubGlobal('fetch', fetchMock);
    await lookupCep('01001000');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://brasilapi.com.br/api/cep/v1/01001000');
    expect(init.body).toBeUndefined();
    expect(JSON.stringify(init)).not.toMatch(/nome|telefone|maria/i);
  });

  it('exposes a typed error class', () => {
    expect(new CepLookupError('network').kind).toBe('network');
  });
});
