// 11_performance_patterns / ex3 - remembering a calculation.
// See tracks/react/lessons/11_performance_patterns/README.md, "Exercise 3".
import { useState } from "react";

export function Report({
  rows,
  compute,
}: {
  rows: number[];
  compute: (rows: number[]) => number;
}) {
  const [open, setOpen] = useState(false);

  const total = compute(rows);

  return (
    <>
      <output>Total: {total}</output>
      <button type="button" onClick={() => setOpen((previous) => !previous)}>
        Toggle details
      </button>
      {open && <p>{rows.length} rows</p>}
    </>
  );
}
