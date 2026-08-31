// d19_custom_hooks_1 / ex4 - reference solution.
import { useState } from "react";

export type PriceRow = { id: string; label: string };

// One row, one component, one useState - called unconditionally, exactly once
// per render of this component, which is the whole of the rule.
function Row({ label }: { label: string }) {
  const [marked, setMarked] = useState(false);
  return (
    <li>
      <span>
        {label}: {marked ? "marked" : "unmarked"}
      </span>
      <button type="button" onClick={() => setMarked(true)}>
        Mark {label}
      </button>
    </li>
  );
}

export function PriceRows({ rows }: { rows: PriceRow[] }) {
  return (
    <ul>
      {rows.map((row) => (
        // The key is what tells React this is the same row as last time, so
        // the state stays with it when the list around it changes.
        <Row key={row.id} label={row.label} />
      ))}
    </ul>
  );
}
