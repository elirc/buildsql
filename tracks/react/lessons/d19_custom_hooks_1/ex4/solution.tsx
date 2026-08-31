// d19_custom_hooks_1 / ex4 - a hook called once per row.
// See tracks/react/lessons/d19_custom_hooks_1/README.md, "Exercise 4".
import { useState } from "react";

export type PriceRow = { id: string; label: string };

export function PriceRows({ rows }: { rows: PriceRow[] }) {
  return (
    <ul>
      {rows.map((row) => {
        // One useState per row, in a loop whose length can change.
        const [marked, setMarked] = useState(false);
        return (
          <li key={row.id}>
            <span>
              {row.label}: {marked ? "marked" : "unmarked"}
            </span>
            <button type="button" onClick={() => setMarked(true)}>
              Mark {row.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
