import type { ReactNode } from 'react';
import styles from './Field.module.css';

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function Field({ id, label, required = false, error, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label id={`${id}-label`} htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <>
            <span className={styles.required} aria-hidden="true">
              {' *'}
            </span>
            <span className={styles.srOnly}> (məcburi)</span>
          </>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}