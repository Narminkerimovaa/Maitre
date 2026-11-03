import { create } from 'zustand';
import { getCategories, type Category } from '@/features/products/api/api';
import { withRetry } from '@/shared/utils/withRetry';

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

interface CategoriesState {
  items: Category[];
  status: LoadStatus;
  fetchCategories: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  items: [],
  status: 'idle',

  fetchCategories: async () => {
    const { status } = get();
    if (status === 'loading' || status === 'success') return;

    set({ status: 'loading' });
    try {
      const items = await withRetry(() => getCategories());
      set({ items, status: 'success' });
    } catch {
      set({ status: 'error' });
    }
  },
}));