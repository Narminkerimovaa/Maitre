import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <svg
              width="28"
              height="24"
              viewBox="0 0 28 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 22V4l12 12L26 4v18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.logoText}>maitre</span>
          </div>
          <span className={styles.badge}>Admin</span>
        </div>

        <div className={styles.user}>
          <span className={styles.userName}>Nərgiz Əliyeva</span>
          <span className={styles.avatar} aria-hidden="true">
            NƏ
          </span>
        </div>
      </div>
    </header>
  );
}
