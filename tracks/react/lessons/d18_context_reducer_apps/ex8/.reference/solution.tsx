// d18_context_reducer_apps / ex8 - reference solution.
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";

export type BasketProduct = { id: string; name: string; price: number };

type Line = BasketProduct & { qty: number };

type BasketState = { lines: Line[] };

type BasketAction =
  | { type: "added"; product: BasketProduct }
  | { type: "more"; id: string }
  | { type: "fewer"; id: string };

/** Change one line's quantity, dropping the line when it reaches zero. */
function changeQty(state: BasketState, id: string, by: number): BasketState {
  return {
    lines: state.lines
      .map((line) => (line.id === id ? { ...line, qty: line.qty + by } : line))
      .filter((line) => line.qty > 0),
  };
}

function basketReducer(state: BasketState, action: BasketAction): BasketState {
  switch (action.type) {
    case "added": {
      const existing = state.lines.find((line) => line.id === action.product.id);
      if (existing === undefined) {
        return { lines: [...state.lines, { ...action.product, qty: 1 }] };
      }
      return changeQty(state, action.product.id, 1);
    }
    case "more":
      return changeQty(state, action.id, 1);
    case "fewer":
      return changeQty(state, action.id, -1);
  }
}

// Two channels. The lines change constantly; the dispatch never does, and the
// buttons that only add things have no business re-rendering when a quantity
// somewhere else goes up.
const BasketLinesContext = createContext<Line[] | null>(null);
const BasketDispatchContext = createContext<Dispatch<BasketAction> | null>(null);

function useLines(): Line[] {
  const value = useContext(BasketLinesContext);
  if (value === null) throw new Error("useLines must be used inside a BasketProvider");
  return value;
}

function useBasketDispatch(): Dispatch<BasketAction> {
  const value = useContext(BasketDispatchContext);
  if (value === null) throw new Error("useBasketDispatch must be used inside a BasketProvider");
  return value;
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(basketReducer, { lines: [] });
  return (
    <BasketLinesContext.Provider value={state.lines}>
      {/* dispatch is guaranteed stable, so this context value never changes */}
      <BasketDispatchContext.Provider value={dispatch}>{children}</BasketDispatchContext.Provider>
    </BasketLinesContext.Provider>
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
  const dispatch = useBasketDispatch();
  return (
    <button type="button" onClick={() => dispatch({ type: "added", product })}>
      Add {product.name}
    </button>
  );
}

export function BasketLines() {
  const lines = useLines();
  const dispatch = useBasketDispatch();
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
  const lines = useLines();
  // Derived while rendering, so it cannot disagree with the lines above it.
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  return <p role="status">Total: {total}</p>;
}
