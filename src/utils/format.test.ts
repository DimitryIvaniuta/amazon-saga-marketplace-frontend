import { formatDateTime, formatMoney, humanize, shortId } from './format';

describe('format utilities', () => {
  it('formats minor monetary units', () => {
    expect(formatMoney(7999, 'PLN')).toMatch(/79[,.]99/);
  });

  it('formats timestamps and empty values', () => {
    expect(formatDateTime('2026-06-20T10:00:00Z')).not.toBe('—');
    expect(formatDateTime(null)).toBe('—');
  });

  it('humanizes machine states', () => {
    expect(humanize('PAYMENT_AUTHORIZED')).toBe('Payment Authorized');
  });

  it('shortens long identifiers', () => {
    expect(shortId('12345678-1234-1234-1234-123456789012')).toBe('12345678…9012');
  });
});
