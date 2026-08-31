// d24_mixed_gauntlet / ex5 - a hook + a reducer + a total nobody has to maintain.
// See tracks/react/lessons/d24_mixed_gauntlet/README.md, "Exercise 5".
import { useReducer, useState } from "react";

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
  const [total] = useState(0);

  function add(product: CartProduct) {
    dispatch({ type: "added", product });
  }

  function remove(id: string) {
    dispatch({ type: "removed", id });
  }

  return { lines, total, add, remove };
}

export function CartPanel({ products }: { products: CartProduct[] }) {
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
