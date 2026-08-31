// d18_context_reducer_apps / ex8 - the whole basket in one context.
// See tracks/react/lessons/d18_context_reducer_apps/README.md, "Exercise 8".
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";

export type BasketProduct = { id: string; name: string; price: number };

type Line = BasketProduct & { qty: number };

type BasketState = { lines: Line[] };

type BasketAction =
  | { type: "added"; product: BasketProduct }
  | { type: "more"; id: string }
  | { type: "fewer"; id: string };

function basketReducer(state: BasketState, action: BasketAction): BasketState {
  switch (action.type) {
    case "added": {
      const existing = state.lines.find((line) => line.id === action.product.id);
      if (existing === undefined) {
        return { lines: [...state.lines, { ...action.product, qty: 1 }] };
      }
      return {
        lines: state.lines.map((line) =>
          line.id === action.product.id ? { ...line, qty: line.qty + 1 } : line,
        ),
      };
    }
    case "more":
      return {
        lines: state.lines.map((line) =>
          line.id === action.id ? { ...line, qty: line.qty + 1 } : line,
        ),
      };
    case "fewer":
      return {
        lines: state.lines.map((line) =>
          line.id === action.id ? { ...line, qty: line.qty - 1 } : line,
        ),
      };
  }
}

const BasketContext = createContext<{
  lines: Line[];
  dispatch: Dispatch<BasketAction>;
} | null>(null);

function useBasket() {
  const value = useContext(BasketContext);
  if (value === null) throw new Error("useBasket must be used inside a BasketProvider");
  return value;
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(basketReducer, { lines: [] });
  return (
    <BasketContext.Provider value={{ lines: state.lines, dispatch }}>
      {children}
    </BasketContext.Provider>
  );
}

export function AddToBasket({
  product,
  onRender,
}: {
  product: BasketProduct;
  onRender: () => void;
}) {
  onRender();
  const { dispatch } = useBasket();
  return (
    <button type="button" onClick={() => dispatch({ type: "added", product })}>
      Add {product.name}
    </button>
  );
}

export function BasketLines() {
  const { lines, dispatch } = useBasket();
  return (
    <ul>
      {lines.map((line) => (
        <li key={line.id}>
          <span>
            {line.name} x{line.qty}
          </span>
          <button type="button" onClick={() => dispatch({ type: "more", id: line.id })}>
            More {line.name}
          </button>
          <button type="button" onClick={() => dispatch({ type: "fewer", id: line.id })}>
            Fewer {line.name}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function BasketTotal() {
  const { lines } = useBasket();
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  return <p role="status">Total: {total}</p>;
}
