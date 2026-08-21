// 04_lists_conditional / review1 - reference solution.
import { useState } from "react";

type Chip = { id: string; label: string };

export function Chips({ items }: { items: Chip[] }) {
  const [chips, setChips] = useState(items);

  function remove(id: string) {
    setChips((previous) => previous.filter((chip) => chip.id !== id));
  }

  return (
    <ul>
      {chips.map((chip) => (
        <li key={chip.id}>
          <button type="button" onClick={() => remove(chip.id)}>
            Remove {chip.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
