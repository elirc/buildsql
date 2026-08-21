// 11_performance_patterns / ex3 - reference solution.
import { useMemo, useState } from "react";

export function Report({
  rows,
  compute,
}: {
  rows: number[];
  compute: (rows: number[]) => number;
}) {
  const [open, setOpen] = useState(false);

  const total = useMemo(() => compute(rows), [rows, compute]);

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
