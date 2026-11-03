import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
}

export function Input({ icon, className, ...rest }: InputProps) {
  const classes = [styles.field, className ?? ''].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <input className={styles.input} {...rest} />
    </div>
  )
}