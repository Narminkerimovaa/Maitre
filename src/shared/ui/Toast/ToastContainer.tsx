import { useToastStore } from './toastStore';
import styles from './ToastContainer.module.css';

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.type === 'error' ? 'alert' : 'status'}
          className={`${styles.toast} ${styles[t.type]}`}
        >
          <span className={styles.message}>{t.message}</span>
          <button
            type="button"
            className={styles.close}
            aria-label="Bağla"
            onClick={() => dismiss(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}