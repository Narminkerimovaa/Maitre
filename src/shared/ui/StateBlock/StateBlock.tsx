import type { ReactNode } from 'react';
import styles from './StateBlock.module.css';

interface StateBlockProps {
  icon: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
  tone?: 'neutral' | 'error';
  role?: 'alert' | 'status';
}

export function StateBlock({
  icon,
  title,
  text,
  action,
  tone = 'neutral',
  role,
}: StateBlockProps) {
  return (
    <div className={styles.block} role={role}>
      <span className={`${styles.icon} ${styles[tone]}`}>{icon}</span>
      <h2 className={styles.title}>{title}</h2>
      {text && <p className={styles.text}>{text}</p>}
      {action}
    </div>
  );
}