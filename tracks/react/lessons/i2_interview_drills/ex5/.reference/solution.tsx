// i2_interview_drills / ex5 - reference solution.
import { useState } from "react";

export type CartLine = { id: string; name: string; price: number; quantity: number };

export function CartEditor({ initialItems }: { initialItems: CartLine[] }) {
  const [items, setItems] = useState(initialItems);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function changeQuantity(id: string, by: number) {
    setItems((previous) =>
      previous
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + by } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  function remove(id: string) {
    setItems((previous) => previous.filter((item) => item.id !== id));
  }

  return (
    <>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span>
              {item.name} x{item.quantity}
            </span>
            <button type="button" onClick={() => changeQuantity(item.id, 1)}>
              Increase {item.name}
            </button>
            <button type="button" onClick={() => changeQuantity(item.id, -1)}>
              Decrease {item.name}
            </button>
            <button type="button" onClick={() => remove(item.id)}>
              Remove {item.name}
            </button>
          </li>
        ))}
      </ul>
      <p role="status">Total: {total.toFixed(2)}</p>
    </>
  );
}
