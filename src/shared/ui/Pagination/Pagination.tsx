import { getPageItems } from '@/shared/utils/pagination';
import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPageItems(page, totalPages);

  return (
    <nav className={styles.nav} aria-label="Səhifələmə">
      <button
        type="button"
        className={styles.button}
        aria-label="Əvvəlki səhifə"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>

      <ul className={styles.pages}>
        {items.map((item, index) =>
          item === '…' ? (
            <li key={`gap-${index}`} className={styles.gap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={`${styles.button} ${item === page ? styles.active : ''}`}
                aria-label={`Səhifə ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <span className={styles.compact}>
        {page} / {totalPages}
      </span>

      <button
        type="button"
        className={styles.button}
        aria-label="Növbəti səhifə"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </nav>
  );
}