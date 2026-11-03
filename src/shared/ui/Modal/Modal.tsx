import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { CloseIcon } from '@/shared/ui/Icons';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  dismissible?: boolean;
  children: ReactNode;
}

export function Modal({ title, onClose, dismissible = true, children }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const pressedOnOverlay = useRef(false);

  useFocusTrap(dialogRef);
  useBodyScrollLock();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && dismissible) {
      event.stopPropagation();
      onClose();
    }
  };

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        pressedOnOverlay.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (dismissible && pressedOnOverlay.current && event.target === event.currentTarget) {
          onClose();
        }
        pressedOnOverlay.current = false;
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={styles.dialog}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label="Bağla"
            disabled={!dismissible}
            onClick={onClose}
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}