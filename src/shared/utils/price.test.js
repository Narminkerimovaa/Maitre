import { formatPrice, parsePrice } from './price';

describe('formatPrice', () => {
  test('2 onluq rəqəmlə yazır', () => {
    expect(formatPrice(4.5)).toBe('4,50\u00A0₼');
    expect(formatPrice(18)).toBe('18,00\u00A0₼');
    expect(formatPrice(0)).toBe('0,00\u00A0₼');
  });
});

describe('parsePrice', () => {
  test('vergül və nöqtəni qəbul edir', () => {
    expect(parsePrice('4,5')).toBe(4.5);
    expect(parsePrice('4.5')).toBe(4.5);
    expect(parsePrice(' 12 ')).toBe(12);
    expect(parsePrice('0')).toBe(0);
  });

  test('yanlış dəyərdə null qaytarır', () => {
    expect(parsePrice('')).toBeNull();
    expect(parsePrice('abc')).toBeNull();
    expect(parsePrice('-3')).toBeNull();
    expect(parsePrice('1.234')).toBeNull();
    expect(parsePrice('4,')).toBeNull();
  });
});