import { PAGE_SIZE } from '@/features/products/store/productsStore';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';
import { ProductsTableHead } from './ProductsTableHead';
import styles from './ProductsTable.module.css';

const rows = Array.from({ length: PAGE_SIZE }, (_, i) => i);

export function TableSkeleton() {
  return (
    <>
      <span className={styles.srOnly} role="status">
        Məhsullar yüklənir…
      </span>

      <table className={styles.table} aria-hidden="true">
        <ProductsTableHead />
        <tbody>
          {rows.map((i) => (
            <tr key={i} className={styles.row}>
              <td>
                <div className={styles.skeletonStack}>
                  <Skeleton width="55%" height={16} />
                  <Skeleton width="35%" height={12} />
                </div>
              </td>
              <td>
                <Skeleton width={90} height={28} radius={50} />
              </td>
              <td>
                <Skeleton width={56} height={16} />
              </td>
              <td>
                <Skeleton width={120} height={24} radius={50} />
              </td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>

      <ul className={styles.cards} aria-hidden="true">
        {rows.map((i) => (
          <li key={i} className={styles.item}>
            <div className={styles.skeletonStack}>
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={12} />
              <Skeleton width={90} height={28} radius={50} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}