import { create } from 'zustand';
import {
  createProduct as apiCreateProduct,
  getProducts,
  updateProduct as apiUpdateProduct,
  type Product,
  type ProductInput,
} from '@/features/products/api/api';
import {
  DEFAULT_QUERY,
  type ProductQuery,
} from '@/features/products/utils/productQuery';
import { toast } from '@/shared/ui/Toast/toastStore';
import type { LoadStatus } from './categoriesStore';

export const PAGE_SIZE = 10;

export function getTotalPages(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Gözlənilməz xəta baş verdi.';
}

interface ProductsState {
  items: Product[];
  total: number;
  query: ProductQuery;
  status: LoadStatus;
  error: string | null;
  hasLoadedOnce: boolean;
  togglingIds: number[];

  init: (query: ProductQuery) => Promise<void>;
  fetchProducts: () => Promise<void>;
  setSearch: (search: string) => Promise<void>;
  setCategory: (categoryId: number | null) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  resetFilters: () => Promise<void>;
  toggleAvailability: (id: number) => Promise<void>;
  createProduct: (input: ProductInput) => Promise<Product>;
  updateProduct: (id: number, changes: Partial<ProductInput>) => Promise<Product>;
}

let latestRequestId = 0;

export const useProductsStore = create<ProductsState>((set, get) => ({
  items: [],
  total: 0,
  query: DEFAULT_QUERY,
  status: 'idle',
  error: null,
  hasLoadedOnce: false,
  togglingIds: [],

  init: (query) => {
    set({ query });
    return get().fetchProducts();
  },

  fetchProducts: async () => {
    const requestId = ++latestRequestId;
    const { query } = get();
    set({ status: 'loading', error: null });

    try {
      const result = await getProducts({
        search: query.search || undefined,
        categoryId: query.categoryId ?? undefined,
        page: query.page,
        pageSize: PAGE_SIZE,
      });
      if (requestId !== latestRequestId) return;

      const lastPage = getTotalPages(result.total);
      if (result.items.length === 0 && result.total > 0 && query.page > lastPage) {
        set((state) => ({ query: { ...state.query, page: lastPage } }));
        return get().fetchProducts();
      }

      set({
        items: result.items,
        total: result.total,
        status: 'success',
        hasLoadedOnce: true,
      });
    } catch (error) {
      if (requestId !== latestRequestId) return;
      set({ status: 'error', error: getErrorMessage(error) });
    }
  },

  setSearch: (search) => {
    if (search === get().query.search) return Promise.resolve();
    set((state) => ({ query: { ...state.query, search, page: 1 } }));
    return get().fetchProducts();
  },

  setCategory: (categoryId) => {
    if (categoryId === get().query.categoryId) return Promise.resolve();
    set((state) => ({ query: { ...state.query, categoryId, page: 1 } }));
    return get().fetchProducts();
  },

  setPage: (page) => {
    const next = Math.max(1, Math.floor(page));
    if (next === get().query.page) return Promise.resolve();
    set((state) => ({ query: { ...state.query, page: next } }));
    return get().fetchProducts();
  },

  resetFilters: () => {
    const { query } = get();
    const isDefault =
      query.search === DEFAULT_QUERY.search &&
      query.categoryId === DEFAULT_QUERY.categoryId &&
      query.page === DEFAULT_QUERY.page;
    if (isDefault) return Promise.resolve();
    set({ query: DEFAULT_QUERY });
    return get().fetchProducts();
  },

  toggleAvailability: async (id) => {
    const current = get().items.find((p) => p.id === id);
    if (!current || get().togglingIds.includes(id)) return;
    const next = !current.isAvailable;

    set((state) => ({
      items: state.items.map((p) => (p.id === id ? { ...p, isAvailable: next } : p)),
      togglingIds: [...state.togglingIds, id],
    }));

    try {
      const updated = await apiUpdateProduct(id, { isAvailable: next });
      set((state) => ({
        items: state.items.map((p) => (p.id === id ? updated : p)),
        togglingIds: state.togglingIds.filter((x) => x !== id),
      }));
    } catch {
      set((state) => ({
        items: state.items.map((p) =>
          p.id === id ? { ...p, isAvailable: current.isAvailable } : p,
        ),
        togglingIds: state.togglingIds.filter((x) => x !== id),
      }));
      toast.error('Status dəyişdirilmədi. Yenidən cəhd edin.');
    }
  },

  createProduct: async (input) => {
    const product = await apiCreateProduct(input);
    void get().fetchProducts(); 
    return product;
  },

  updateProduct: async (id, changes) => {
    const updated = await apiUpdateProduct(id, changes);
    set((state) => ({
      items: state.items.map((p) => (p.id === id ? updated : p)),
    }));
    return updated;
  },
}));