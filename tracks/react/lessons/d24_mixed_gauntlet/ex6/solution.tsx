// d24_mixed_gauntlet / ex6 - a queue where every item has its own clock.
// See tracks/react/lessons/d24_mixed_gauntlet/README.md, "Exercise 6".
import { useCallback, useEffect, useRef, useState } from "react";

type Toast = { id: number; message: string };

export function ToastQueue({ autoDismissMs }: { autoDismissMs: number }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => setToasts([]), autoDismissMs);
    return () => clearTimeout(timer);
  }, [toasts, autoDismissMs]);

  function notify() {
    const id = nextId.current;
    nextId.current += 1;
    setToasts((current) => [...current, { id, message: `Message ${id}` }]);
  }

  return (
    <>
      <button type="button" onClick={notify}>
        Notify
      </button>
      <div role="status">
        <ul>
          {toasts.map((toast) => (
            <li key={toast.id}>
              <span>{toast.message}</span>
              <button type="button" onClick={() => dismiss(toast.id)}>
                Dismiss {toast.message}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
