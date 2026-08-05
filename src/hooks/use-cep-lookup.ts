import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CepLookupError,
  isPartialResult,
  lookupCep,
  normalizeCep,
  type AddressLookupResult,
} from '@/lib/cep';

export type CepStatus = 'idle' | 'loading' | 'success' | 'partial' | 'invalid' | 'not_found' | 'error';

interface Options {
  enabled?: boolean;
  onResult: (result: AddressLookupResult, partial: boolean) => void;
  onNotFound: () => void;
}

const DEBOUNCE_MS = 300;

export function useCepLookup({ enabled = true, onResult, onNotFound }: Options) {
  const [status, setStatus] = useState<CepStatus>('idle');
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const lastCepRef = useRef('');

  const cancel = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  const run = useCallback(
    async (value: string) => {
      const cep = normalizeCep(value);
      if (!enabled) return;
      if (cep.length !== 8) {
        setStatus(cep.length === 0 ? 'idle' : 'invalid');
        return;
      }

      cancel();
      const controller = new AbortController();
      abortRef.current = controller;
      const id = ++requestIdRef.current;
      lastCepRef.current = cep;
      setStatus('loading');

      try {
        const result = await lookupCep(cep, controller.signal);
        // A newer CEP was requested meanwhile — discard this stale response.
        if (id !== requestIdRef.current) return;
        const partial = isPartialResult(result);
        onResult(result, partial);
        setStatus(partial ? 'partial' : 'success');
      } catch (err) {
        if (id !== requestIdRef.current) return;
        const kind = err instanceof CepLookupError ? err.kind : 'network';
        if (kind === 'aborted') return;
        if (kind === 'not_found') {
          onNotFound();
          setStatus('not_found');
        } else if (kind === 'invalid') {
          setStatus('invalid');
        } else {
          setStatus('error');
        }
      }
    },
    [cancel, enabled, onNotFound, onResult],
  );

  /** Called on every keystroke; only fires a request at exactly 8 digits. */
  const handleChange = useCallback(
    (value: string) => {
      const cep = normalizeCep(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
      abortRef.current = null;

      if (cep.length !== 8) {
        requestIdRef.current++;
        lastCepRef.current = cep;
        setStatus('idle');
        return;
      }
      if (cep === lastCepRef.current && status === 'loading') return;
      debounceRef.current = setTimeout(() => void run(cep), DEBOUNCE_MS);
    },
    [run, status],
  );

  const handleBlur = useCallback(
    (value: string) => {
      const cep = normalizeCep(value);
      if (cep.length === 0) return setStatus('idle');
      if (cep.length !== 8) return setStatus('invalid');
      if (status === 'idle') void run(cep);
    },
    [run, status],
  );

  const retry = useCallback((value: string) => void run(value), [run]);

  return { status, handleChange, handleBlur, retry, cancel };
}
