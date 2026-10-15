import { isOwnedReceiptPath, sanitizeReceiptFileName } from '@/libs/receiptStorage';

describe('isOwnedReceiptPath', () => {
  const userId = '8d3e23f1-0000-4000-8000-000000000001';

  it('accepts a path inside the user folder', () => {
    expect(isOwnedReceiptPath(`${userId}/abc-receipt.jpg`, userId)).toBe(true);
  });

  it('rejects another user folder and bare prefixes', () => {
    expect(isOwnedReceiptPath('someone-else/abc.jpg', userId)).toBe(false);
    expect(isOwnedReceiptPath(`${userId}-evil/abc.jpg`, userId)).toBe(false);
    expect(isOwnedReceiptPath(`${userId}/`, userId)).toBe(false);
  });

  it('rejects traversal and malformed segments', () => {
    expect(isOwnedReceiptPath(`${userId}/../other/abc.jpg`, userId)).toBe(false);
    expect(isOwnedReceiptPath(`${userId}//abc.jpg`, userId)).toBe(false);
    expect(isOwnedReceiptPath(`${userId}\\abc.jpg`, userId)).toBe(false);
  });

  it('rejects URLs and non-strings', () => {
    expect(isOwnedReceiptPath('https://evil.example/x.jpg', userId)).toBe(false);
    expect(isOwnedReceiptPath(undefined, userId)).toBe(false);
    expect(isOwnedReceiptPath(42, userId)).toBe(false);
  });
});

describe('sanitizeReceiptFileName', () => {
  it('strips path separators and unsafe characters', () => {
    expect(sanitizeReceiptFileName('../../etc/passwd')).toBe('_.._etc_passwd');
    expect(sanitizeReceiptFileName('struk belanja (1).jpg')).toBe('struk_belanja__1_.jpg');
  });

  it('falls back when nothing usable remains', () => {
    expect(sanitizeReceiptFileName('....')).toBe('receipt');
  });

  it('keeps only the tail of very long names', () => {
    expect(sanitizeReceiptFileName('a'.repeat(200) + '.jpg')).toHaveLength(80);
  });
});
