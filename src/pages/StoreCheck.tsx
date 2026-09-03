import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Copy, ExternalLink, Download, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/use-products';
import { useSiteContent } from '@/context/SiteContentContext';
import { useStore } from '@/hooks/use-store';
import { spreadsheetUrl } from '@/lib/catalog-loader';
import {
  buildStoreCheckReport,
  downloadFile,
  issuesToCsv,
  reportToText,
  type CheckItem,
} from '@/lib/store-check';
import { toast } from '@/hooks/use-toast';

const StatusIcon = ({ status }: { status: CheckItem['status'] }) => {
  const className = 'w-4 h-4 shrink-0 mt-0.5';
  if (status === 'ok') return <CheckCircle2 className={`${className} text-primary`} />;
  if (status === 'warn') return <AlertTriangle className={`${className} text-amber-600`} />;
  if (status === 'error') return <XCircle className={`${className} text-destructive`} />;
  return <Info className={`${className} text-muted-foreground`} />;
};

/**
 * Public client-side diagnostics page (/verificar-loja).
 * No authentication and no backend — it only reflects what the browser loaded.
 * Sensitive configuration is never displayed.
 */
const StoreCheck = () => {
  const catalog = useProducts();
  const siteContent = useSiteContent();
  const store = useStore();
  const [refreshing, setRefreshing] = useState(false);

  const report = useMemo(
    () =>
      buildStoreCheckReport({
        products: catalog.products,
        issues: catalog.issues,
        totalRows: catalog.totalRows,
        source: catalog.source,
        updatedAt: catalog.updatedAt,
        spreadsheetConfigured: catalog.spreadsheetConfigured,
        spreadsheetError: catalog.spreadsheetError,
        contentStatus: siteContent.status,
        contentError: siteContent.error,
        contentKeyCount: siteContent.keyCount,
        content: siteContent.content,
        store,
      }),
    [catalog, siteContent, store],
  );

  const sheetUrl = spreadsheetUrl();

  const handleRefresh = async () => {
    setRefreshing(true);
    siteContent.reload();
    await catalog.refreshProducts();
    setRefreshing(false);
    toast({ title: 'Dados atualizados' });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportToText(report));
      toast({ title: 'Diagnóstico copiado' });
    } catch {
      toast({ title: 'Não foi possível copiar', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-serif mb-2">Verificar loja</h1>
      <p className="text-muted-foreground mb-6">
        Esta página mostra como a loja está lendo a planilha da comunidade. Ela funciona
        totalmente no navegador e não exibe informações sensíveis.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar dados
        </Button>
        <Button variant="outline" onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          Copiar diagnóstico
        </Button>
        {sheetUrl && (
          <Button variant="outline" asChild>
            <a href={sheetUrl} target="_blank" rel="noreferrer noopener">
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir planilha
            </a>
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() =>
            downloadFile(
              'relatorio-loja.json',
              JSON.stringify(report, null, 2),
              'application/json',
            )
          }
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar JSON
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            downloadFile('erros-catalogo.csv', issuesToCsv(report.issues), 'text/csv')
          }
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar CSV
        </Button>
      </div>

      <section aria-labelledby="checks-title" className="mb-10">
        <h2 id="checks-title" className="text-xl font-serif mb-3">
          Situação atual
        </h2>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {report.items.map((item) => (
            <li key={item.key} className="p-4 flex gap-3">
              <StatusIcon status={item.status} />
              <div className="min-w-0">
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground break-words">{item.value}</p>
                {item.status !== 'ok' && item.hint && (
                  <p className="text-xs text-muted-foreground mt-1">{item.hint}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="issues-title">
        <h2 id="issues-title" className="text-xl font-serif mb-3">
          Linhas com problemas ({report.issues.length})
        </h2>
        {report.issues.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhum problema encontrado nas linhas carregadas.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-2 font-medium">Linha</th>
                  <th className="p-2 font-medium">Produto</th>
                  <th className="p-2 font-medium">Campo</th>
                  <th className="p-2 font-medium">Problema</th>
                </tr>
              </thead>
              <tbody>
                {report.issues.map((issue, i) => (
                  <tr key={`${issue.row}-${issue.code}-${i}`} className="border-t border-border">
                    <td className="p-2 align-top">{issue.row}</td>
                    <td className="p-2 align-top">{issue.name ?? '—'}</td>
                    <td className="p-2 align-top">{issue.field}</td>
                    <td className="p-2 align-top">
                      <span
                        className={
                          issue.severity === 'error' ? 'text-destructive' : 'text-amber-700'
                        }
                      >
                        {issue.message}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-10">
        <Link to="/" className="underline underline-offset-2">
          Voltar para a loja
        </Link>
      </p>
    </div>
  );
};

export default StoreCheck;
