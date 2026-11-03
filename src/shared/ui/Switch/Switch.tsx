import type { ButtonHTMLAttributes } from 'react'
import styles from './Switch.module.css'

interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'role'> {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Switch({ checked, onChange, className, ...rest }: SwitchProps) {
  const classes = [styles.switch, checked ? styles.checked : '', className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={classes}
      onClick={() => onChange(!checked)}
      {...rest}
    >
      <span className={styles.knob} />
    </button>
  )
}