import { useEffect } from 'react';
import { useProductsStore } from '@/features/products/store/productsStore';
import {
  parseProductQuery,
  serializeProductQuery,
} from '@/features/products/utils/productQuery';

export function useProductsUrlSync() {
  useEffect(() => {
    const unsubscribe = useProductsStore.subscribe((state, prev) => {
      if (state.query === prev.query) return;
      const search = serializeProductQuery(state.query);
      if (search !== window.location.search) {
        window.history.replaceState(null, '', `${window.location.pathname}${search}`);
      }
    });

    void useProductsStore.getState().init(parseProductQuery(window.location.search));

    return unsubscribe;
  }, []);
}