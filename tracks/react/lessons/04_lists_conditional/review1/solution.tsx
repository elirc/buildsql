// 04_lists_conditional / review1 - removing one item from a list in state.
// See tracks/react/lessons/04_lists_conditional/README.md, "Review".
import { useState } from "react";

type Chip = { id: string; label: string };

export function Chips({ items }: { items: Chip[] }) {
  const [chips] = useState(items);

  return (
    <ul>
      {chips.map((chip) => (
        <li key={chip.id}>
          <button type="button">Remove {chip.label}</button>
        </li>
      ))}
    </ul>
  );
}
