import { useCallback, useEffect, useState } from 'react';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

type Subscriber = (toasts: ToastItem[]) => void;

const subscribers: Set<Subscriber> = new Set();
let toastsState: ToastItem[] = [];

const notifySubscribers = () => {
  for (const subscriber of subscribers) {
    subscriber([...toastsState]);
  }
};

let toastIdCounter = 0;

const generateId = (): string => {
  toastIdCounter += 1;
  return `toast-${Date.now()}-${toastIdCounter}`;
};

export const addToast = (message: string, type: ToastType = 'info', duration = 4000): string => {
  const id = generateId();
  toastsState = [...toastsState, { id, message, type }];
  notifySubscribers();

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
};

export const removeToast = (id: string): void => {
  toastsState = toastsState.filter((t) => t.id !== id);
  notifySubscribers();
};

const subscribe = (subscriber: Subscriber): (() => void) => {
  subscribers.add(subscriber);
  subscriber([...toastsState]);
  return () => {
    subscribers.delete(subscriber);
  };
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>(toastsState);

  useEffect(() => {
    const unsubscribe = subscribe((newToasts) => {
      setToasts(newToasts);
    });
    return unsubscribe;
  }, []);

  const add = useCallback((message: string, type: ToastType = 'info') => {
    return addToast(message, type);
  }, []);

  const remove = useCallback((id: string) => {
    removeToast(id);
  }, []);

  return { toasts, addToast: add, removeToast: remove };
};

const typeStyles: Record<ToastType, React.CSSProperties> = {
  info: { backgroundColor: '#dbeafe', color: '#1e40af', borderLeftColor: '#3b82f6' },
  success: { backgroundColor: '#dcfce7', color: '#166534', borderLeftColor: '#22c55e' },
  error: { backgroundColor: '#fee2e2', color: '#991b1b', borderLeftColor: '#ef4444' },
  warning: { backgroundColor: '#fef3c7', color: '#92400e', borderLeftColor: '#f59e0b' },
};

const typeIcons: Record<ToastType, string> = {
  info: 'ℹ️',
  success: '✅',
  error: '❌',
  warning: '⚠️',
};

export interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const ToastContainer = ({ position = 'top-right' }: ToastContainerProps) => {
  const { toasts, removeToast } = useToast();

  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: '1rem', right: '1rem' },
    'top-left': { top: '1rem', left: '1rem' },
    'bottom-right': { bottom: '1rem', right: '1rem' },
    'bottom-left': { bottom: '1rem', left: '1rem' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '400px',
        width: 'calc(100% - 2rem)',
        ...positionStyles[position],
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            borderLeft: '4px solid',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            animation: 'toastSlideIn 0.2s ease-out',
            ...typeStyles[toast.type],
          }}
        >
          <span style={{ flexShrink: 0, fontSize: '1.1rem' }}>{typeIcons[toast.type]}</span>
          <span style={{ flex: 1, fontSize: '0.875rem', lineHeight: 1.4 }}>{toast.message}</span>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '1rem',
              color: 'inherit',
              opacity: 0.7,
              padding: '0 0.25rem',
              minHeight: '24px',
              minWidth: '24px',
            }}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(1rem);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default useToast;
