import styles from './ProductsTable.module.css';

export function ProductsTableHead() {
  return (
    <>
      <colgroup>
        <col />
        <col className={styles.colCategory} />
        <col className={styles.colPrice} />
        <col className={styles.colStatus} />
        <col className={styles.colActions} />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Ad</th>
          <th scope="col">Kateqoriya</th>
          <th scope="col" className={styles.right}>
            Qiymət
          </th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className={styles.srOnly}>Əməliyyatlar</span>
          </th>
        </tr>
      </thead>
    </>
  );
}