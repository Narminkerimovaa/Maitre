import type { ReactNode } from 'react';
import type { Product } from '@/features/products/api/api';
import { formatPrice } from '@/shared/utils/price';
import { Button } from '@/shared/ui/Button/Button';
import { Switch } from '@/shared/ui/Switch/Switch';
import styles from './ProductsTable.module.css';

export interface ProductItemProps {
  product: Product;
  category: ReactNode;
  toggling: boolean;
  onToggle: (id: number) => void;
  onEdit: (product: Product) => void;
}

export function ProductRow({ product, category, toggling, onToggle, onEdit }: ProductItemProps) {
  return (
    <tr className={`${styles.row} ${product.isAvailable ? '' : styles.off}`}>
      <td>
        <div className={styles.name}>{product.nameAz}</div>
        <div className={styles.nameEn}>{product.nameEn ?? '—'}</div>
      </td>
      <td>{category}</td>
      <td className={styles.price}>{formatPrice(product.price)}</td>
      <td>
        <div className={styles.status}>
          <Switch
            checked={product.isAvailable}
            onChange={() => onToggle(product.id)}
            disabled={toggling}
            aria-label={`Satış statusu: ${product.nameAz}`}
          />
          <span>{product.isAvailable ? 'Satışda' : 'Satışda deyil'}</span>
        </div>
      </td>
      <td className={styles.actions}>
        <Button
          size="sm"
          variant="secondary"
          aria-label={`Düzəlt: ${product.nameAz}`}
          onClick={() => onEdit(product)}
        >
          Düzəlt
        </Button>
      </td>
    </tr>
  );
}