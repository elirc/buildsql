// d24_mixed_gauntlet / ex5 - reference solution.
import { useCallback, useReducer } from "react";

export type CartProduct = { id: string; name: string; price: number };

export type Line = CartProduct & { qty: number };

type CartAction = { type: "added"; product: CartProduct } | { type: "removed"; id: string };

function cartReducer(lines: Line[], action: CartAction): Line[] {
  switch (action.type) {
    case "added": {
      const existing = lines.find((line) => line.id === action.product.id);
      if (existing === undefined) return [...lines, { ...action.product, qty: 1 }];
      return lines.map((line) =>
        line.id === action.product.id ? { ...line, qty: line.qty + 1 } : line,
      );
    }
    case "removed":
      return lines
        .map((line) => (line.id === action.id ? { ...line, qty: line.qty - 1 } : line))
        .filter((line) => line.qty > 0);
  }
}

export function useCart() {
  const [lines, dispatch] = useReducer(cartReducer, [] as Line[]);

  // Derived while rendering. Kept in state it would be a second copy of the
  // same fact, and every action ever added to the reducer would have to
  // remember to update it.
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);

  // `dispatch` is stable, so neither of these has anything to depend on - and
  // a hook that hands out new functions every render makes work for everybody
  // who consumes it.
  const add = useCallback((product: CartProduct) => dispatch({ type: "added", product }), []);
  const remove = useCallback((id: string) => dispatch({ type: "removed", id }), []);

  return { lines, total, add, remove };
}

export function CartPanel({ products }: { products: CartProduct[] }) {
  // The panel is only markup. Everything a cart is lives in the hook, which is
  // why the gate can test the cart without rendering anything at all.
  const { lines, total, add } = useCart();

  return (
    <>
      {products.map((product) => (
        <button key={product.id} type="button" onClick={() => add(product)}>
          Add {product.name}
        </button>
      ))}
      <ul>
        {lines.map((line) => (
          <li key={line.id}>
            {line.name} x{line.qty}
          </li>
        ))}
      </ul>
      <p role="status">Total: {total}</p>
    </>
  );
}
