export interface ProductQuery {
  search: string;
  categoryId: number | null;
  page: number;
}

export const DEFAULT_QUERY: ProductQuery = { search: '', categoryId: null, page: 1 };

function toPositiveInt(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  const n = Number(value);
  return n > 0 ? n : null;
}

export function parseProductQuery(search: string): ProductQuery {
  const params = new URLSearchParams(search);
  return {
    search: (params.get('q') ?? '').trim(),
    categoryId: toPositiveInt(params.get('category')),
    page: toPositiveInt(params.get('page')) ?? 1,
  };
}

export function serializeProductQuery(query: ProductQuery): string {
  const params = new URLSearchParams();
  if (query.search) params.set('q', query.search);
  if (query.categoryId !== null) params.set('category', String(query.categoryId));
  if (query.page > 1) params.set('page', String(query.page));
  const text = params.toString();
  return text ? `?${text}` : '';
}