import { describe, it, expect, vi, afterEach } from 'vitest';
import { csvToObjects, fetchSheetRows, googleCsvUrl } from './sheet-fetch';

describe('leitura direta do Google Sheets', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('lê CSV com aspas, vírgulas e quebras de linha', () => {
    const rows = csvToObjects('id,nome,descricao\n1,"Cesto, grande","Linha 1\nLinha ""2"""\n,,\n');
    expect(rows).toEqual([{ id: '1', nome: 'Cesto, grande', descricao: 'Linha 1\nLinha "2"' }]);
  });

  it('usa a URL de exportação do Google, sem proxy', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('id,nome\n1,Cesto'));
    vi.stubGlobal('fetch', fetchMock);
    const rows = await fetchSheetRows('abc', 'Produtos');
    expect(fetchMock).toHaveBeenCalledWith(googleCsvUrl('abc', 'Produtos'));
    expect(fetchMock.mock.calls[0][0]).toContain('docs.google.com');
    expect(rows).toEqual([{ id: '1', nome: 'Cesto' }]);
  });

  it('recorre ao OpenSheet quando o Google falha', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('<html>login</html>'))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: '2' }])));
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchSheetRows('abc', 'Produtos')).toEqual([{ id: '2' }]);
    expect(fetchMock.mock.calls[1][0]).toContain('opensheet.elk.sh');
  });
});
