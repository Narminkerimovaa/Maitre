import { formatPrice } from '@/shared/utils/price';
import { Button } from '@/shared/ui/Button/Button';
import { Switch } from '@/shared/ui/Switch/Switch';
import type { ProductItemProps } from './ProductRow';
import styles from './ProductsTable.module.css';

export function ProductCard({ product, category, toggling, onToggle, onEdit }: ProductItemProps) {
  return (
    <li className={`${styles.item} ${product.isAvailable ? '' : styles.off}`}>
      <div className={styles.itemTop}>
        <div>
          <div className={styles.name}>{product.nameAz}</div>
          <div className={styles.nameEn}>{product.nameEn ?? '—'}</div>
        </div>
        <div className={styles.price}>{formatPrice(product.price)}</div>
      </div>

      <div className={styles.itemMeta}>{category}</div>

      <div className={styles.itemBottom}>
        <div className={styles.status}>
          <Switch
            checked={product.isAvailable}
            onChange={() => onToggle(product.id)}
            disabled={toggling}
            aria-label={`Satış statusu: ${product.nameAz}`}
          />
          <span>{product.isAvailable ? 'Satışda' : 'Satışda deyil'}</span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          aria-label={`Düzəlt: ${product.nameAz}`}
          onClick={() => onEdit(product)}
        >
          Düzəlt
        </Button>
      </div>
    </li>
  );
}