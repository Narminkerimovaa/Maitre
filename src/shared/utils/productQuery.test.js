import { parseProductQuery, serializeProductQuery, DEFAULT_QUERY } from './productQuery';

describe('parseProductQuery', () => {
  test('boş URL default qaytarır', () => {
    expect(parseProductQuery('')).toEqual(DEFAULT_QUERY);
  });

  test('bütün parametrləri oxuyur', () => {
    expect(parseProductQuery('?q=dovğa&category=2&page=3')).toEqual({
      search: 'dovğa',
      categoryId: 2,
      page: 3,
    });
  });

  test('yanlış dəyərləri default edir', () => {
    expect(parseProductQuery('?page=abc&category=xyz')).toEqual(DEFAULT_QUERY);
    expect(parseProductQuery('?page=0&category=-1')).toEqual(DEFAULT_QUERY);
    expect(parseProductQuery('?page=2.5')).toEqual(DEFAULT_QUERY);
  });

  test('axtarışın boşluqlarını silir', () => {
    expect(parseProductQuery('?q=%20%20plov%20').search).toBe('plov');
  });
});

describe('serializeProductQuery', () => {
  test('default dəyərlər üçün boş sətir qaytarır', () => {
    expect(serializeProductQuery(DEFAULT_QUERY)).toBe('');
  });

  test('yalnız default olmayanları yazır', () => {
    expect(serializeProductQuery({ search: '', categoryId: 2, page: 1 })).toBe('?category=2');
    expect(serializeProductQuery({ search: 'plov', categoryId: null, page: 3 })).toBe('?q=plov&page=3');
  });

  test('parse ilə qarşılıqlı uyğundur (Azərbaycan hərfləri ilə)', () => {
    const query = { search: 'şah plov', categoryId: 3, page: 2 };
    expect(parseProductQuery(serializeProductQuery(query))).toEqual(query);
  });
});