import { downloadCsv, toCsv } from './csv';

describe('toCsv', () => {
  it('quotes commas, quotes, and new lines', () => {
    expect(toCsv([{ sku: 'A,1', note: 'A "quote"\nline' }])).toBe('sku,note\r\n"A,1","A ""quote""\nline"\r\n');
  });

  it('neutralizes spreadsheet formulas', () => {
    expect(toCsv([{ sku: '=HYPERLINK("bad")', quantity: 1 }])).toContain("'=");
  });

  it('returns an empty string for no rows', () => {
    expect(toCsv([])).toBe('');
  });

  it('downloads a generated CSV and revokes the object URL', () => {
    vi.useFakeTimers();
    const createObjectUrl = vi.fn(() => 'blob:csv');
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectUrl });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    downloadCsv('inventory.csv', [{ sku: 'SKU-1', quantity: 3 }]);

    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    vi.runAllTimers();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:csv');
    vi.useRealTimers();
  });

});
