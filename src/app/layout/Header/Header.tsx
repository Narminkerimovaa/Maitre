import styles from "./Header.module.css";
import { LogoMark } from "../LogoMark";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <div className={styles.logo}>
              <LogoMark />
              <span className={styles.logoText}>maitre</span>
            </div>
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
