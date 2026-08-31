// d24_mixed_gauntlet / ex6 - reference solution.
import { useCallback, useEffect, useRef, useState } from "react";

type Toast = { id: number; message: string };

// One toast, one component, one effect - which is the only way each toast can
// have a clock of its own. The cleanup covers both dismissing it by hand and
// the whole queue going away.
function ToastRow({
  toast,
  autoDismissMs,
  onDismiss,
}: {
  toast: Toast;
  autoDismissMs: number;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), autoDismissMs);
    return () => clearTimeout(timer);
  }, [toast.id, autoDismissMs, onDismiss]);

  return (
    <li>
      <span>{toast.message}</span>
      <button type="button" onClick={() => onDismiss(toast.id)}>
        Dismiss {toast.message}
      </button>
    </li>
  );
}

export function ToastQueue({ autoDismissMs }: { autoDismissMs: number }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Ids come from a counter that only ever goes up, so a number is never
  // reused by a toast that arrives after another has been dismissed.
  const nextId = useRef(1);

  // Stable, so the row's effect does not re-arm its timer on every render of
  // the queue - which would mean no toast ever expired.
  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

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
            <ToastRow
              key={toast.id}
              toast={toast}
              autoDismissMs={autoDismissMs}
              onDismiss={dismiss}
            />
          ))}
        </ul>
      </div>
    </>
  );
}
