// d18_context_reducer_apps / ex1 - an id borrowed from the length of the list.
// See tracks/react/lessons/d18_context_reducer_apps/README.md, "Exercise 1".
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";

type Toast = { id: number; message: string };

type ToastState = { toasts: Toast[] };

type ToastAction = { type: "added"; message: string } | { type: "dismissed"; id: number };

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "added":
      return {
        toasts: [...state.toasts, { id: state.toasts.length, message: action.message }],
      };
    case "dismissed":
      return { toasts: state.toasts.filter((toast) => toast.id !== action.id) };
  }
}

const ToastContext = createContext<{
  toasts: Toast[];
  dispatch: Dispatch<ToastAction>;
} | null>(null);

function useToasts() {
  const value = useContext(ToastContext);
  if (value === null) throw new Error("useToasts must be used inside a ToastProvider");
  return value;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });
  return (
    <ToastContext.Provider value={{ toasts: state.toasts, dispatch }}>
      {children}
    </ToastContext.Provider>
  );
}

export function ToastTrigger({ message }: { message: string }) {
  const { dispatch } = useToasts();
  return (
    <button type="button" onClick={() => dispatch({ type: "added", message })}>
      Notify {message}
    </button>
  );
}

export function ToastList() {
  const { toasts, dispatch } = useToasts();
  return (
    <ul>
      {toasts.map((toast) => (
        <li key={toast.id}>
          <span>{toast.message}</span>
          <button type="button" onClick={() => dispatch({ type: "dismissed", id: toast.id })}>
            Dismiss {toast.message}
          </button>
        </li>
      ))}
    </ul>
  );
}
