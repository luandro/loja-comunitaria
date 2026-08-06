import { AlertTriangle } from 'lucide-react';
import { useStore } from '@/hooks/use-store';

/**
 * Configuration diagnostics for the community operator.
 * Shown only when essential values are missing — it never fabricates data.
 */
export const StoreDiagnostics = () => {
  const { diagnostics, t } = useStore();
  if (diagnostics.length === 0) return null;

  return (
    <div role="status" className="bg-amber-50 border-b border-amber-200 text-amber-900">
      <div className="container mx-auto py-3 flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold">{t('diagnostics_title')}</p>
          <ul className="list-disc pl-5 mt-1 space-y-0.5">
            {diagnostics.map((d) => (
              <li key={d.key}>{d.message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
