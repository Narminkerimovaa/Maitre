import { useMemo } from 'react';
import type { Product } from '@/features/products/api/api';
import { useCategoriesStore } from '@/features/products/store/categoriesStore';
import { useProductsStore } from '@/features/products/store/productsStore';
import { Button } from '@/shared/ui/Button/Button';
import { Chip } from '@/shared/ui/Chip/Chip';
import { AlertIcon, PlusIcon, SearchIcon } from '@/shared/ui/Icons';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import { StateBlock } from '@/shared/ui/StateBlock/StateBlock';
import { ProductCard } from './ProductCard';
import { ProductRow } from './ProductRow';
import { ProductsTableHead } from './ProductsTableHead';
import { TableSkeleton } from './TableSkeleton';
import styles from './ProductsTable.module.css';

interface ProductsTableProps {
  onCreate: () => void;
  onEdit: (product: Product) => void;
}

export function ProductsTable({ onCreate, onEdit }: ProductsTableProps) {
  const items = useProductsStore((s) => s.items);
  const status = useProductsStore((s) => s.status);
  const error = useProductsStore((s) => s.error);
  const togglingIds = useProductsStore((s) => s.togglingIds);
  const hasFilter = useProductsStore(
    (s) => s.query.search !== '' || s.query.categoryId !== null,
  );
  const fetchProducts = useProductsStore((s) => s.fetchProducts);
  const toggleAvailability = useProductsStore((s) => s.toggleAvailability);
  const resetFilters = useProductsStore((s) => s.resetFilters);

  const categories = useCategoriesStore((s) => s.items);
  const categoriesStatus = useCategoriesStore((s) => s.status);
  const categoryNames = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  if (status === 'error') {
    return (
      <section className={styles.card}>
        <StateBlock
          role="alert"
          tone="error"
          icon={<AlertIcon width={24} height={24} />}
          title="Məhsullar yüklənmədi"
          text={error ?? 'Gözlənilməz xəta baş verdi.'}
          action={<Button onClick={() => void fetchProducts()}>Yenidən cəhd et</Button>}
        />
      </section>
    );
  }

  if (items.length === 0 && status !== 'success') {
    return (
      <section className={styles.card} aria-busy="true">
        <TableSkeleton />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={styles.card}>
        {hasFilter ? (
          <StateBlock
            icon={<SearchIcon width={24} height={24} />}
            title="Nəticə tapılmadı"
            text="Axtarışı və ya filteri dəyişib yenidən cəhd edin."
            action={
              <Button variant="secondary" onClick={() => void resetFilters()}>
                Filteri təmizlə
              </Button>
            }
          />
        ) : (
          <StateBlock
            icon={<PlusIcon width={24} height={24} />}
            title="Hələ məhsul yoxdur"
            text="Menyuya ilk məhsulu əlavə edin."
            action={<Button onClick={onCreate}>Yeni məhsul</Button>}
          />
        )}
      </section>
    );
  }

  const renderCategory = (product: Product) => {
    const name = categoryNames.get(product.categoryId);
    if (name) {
      return <Chip variant={product.isAvailable ? 'filled' : 'outline'}>{name}</Chip>;
    }
    return categoriesStatus === 'error' ? '—' : <Skeleton width={90} height={28} radius={50} />;
  };

  const isRefreshing = status === 'loading';

  return (
    <section
      className={`${styles.card} ${isRefreshing ? styles.refreshing : ''}`}
      aria-busy={isRefreshing}
    >
      <table className={styles.table}>
        <ProductsTableHead />
        <tbody>
          {items.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              category={renderCategory(product)}
              toggling={togglingIds.includes(product.id)}
              onToggle={(id) => void toggleAvailability(id)}
              onEdit={onEdit}
            />
          ))}
        </tbody>
      </table>

      <ul className={styles.cards}>
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            category={renderCategory(product)}
            toggling={togglingIds.includes(product.id)}
            onToggle={(id) => void toggleAvailability(id)}
            onEdit={onEdit}
          />
        ))}
      </ul>
    </section>
  );
}