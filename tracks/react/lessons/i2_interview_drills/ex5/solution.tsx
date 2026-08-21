// i2_interview_drills / ex5 - "a cart editor: quantities, removal, a total."
// See tracks/react/lessons/i2_interview_drills/README.md, "Drill 5".
import { useState } from "react";

export type CartLine = { id: string; name: string; price: number; quantity: number };

export function CartEditor({ initialItems }: { initialItems: CartLine[] }) {
  const [items] = useState(initialItems);

  return (
    <>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span>
              {item.name} x{item.quantity}
            </span>
            <button type="button">Increase {item.name}</button>
            <button type="button">Decrease {item.name}</button>
            <button type="button">Remove {item.name}</button>
          </li>
        ))}
      </ul>
      <p role="status">Total: 0.00</p>
    </>
  );
}
