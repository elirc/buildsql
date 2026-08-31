// d22_render_performance / ex3 - reference solution.
import { useState } from "react";

export type ExpandableRow = { id: string; label: string };

function RowBody({ row, onRender }: { row: ExpandableRow; onRender: (id: string) => void }) {
  onRender(row.id);
  return <p>{row.label} details</p>;
}

function Row({
  row,
  onBodyRender,
}: {
  row: ExpandableRow;
  onBodyRender: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li>
      <button type="button" onClick={() => setOpen((current) => !current)}>
        {open ? "Close" : "Open"} {row.label}
      </button>
      {/* Not rendered and hidden - not rendered at all. The cheapest render is
          the one that never happens, and a closed row has nothing worth
          building: no DOM, no effects, no requests. */}
      {open && <RowBody row={row} onRender={onBodyRender} />}
    </li>
  );
}

export function ExpandableRows({
  rows,
  onBodyRender,
}: {
  rows: ExpandableRow[];
  onBodyRender: (id: string) => void;
}) {
  return (
    <ul>
      {rows.map((row) => (
        <Row key={row.id} row={row} onBodyRender={onBodyRender} />
      ))}
    </ul>
  );
}
