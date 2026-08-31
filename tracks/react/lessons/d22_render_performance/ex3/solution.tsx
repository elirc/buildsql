// d22_render_performance / ex3 - built, then hidden.
// See tracks/react/lessons/d22_render_performance/README.md, "Exercise 3".
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
      <div hidden={!open}>
        <RowBody row={row} onRender={onBodyRender} />
      </div>
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
