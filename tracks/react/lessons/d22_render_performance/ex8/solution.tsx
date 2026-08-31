// d22_render_performance / ex8 - one pipeline, redone from the top every time.
// See tracks/react/lessons/d22_render_performance/README.md, "Exercise 8".
import { useId, useState } from "react";

export type TableRow = { id: string; name: string };

function Row({
  row,
  starred,
  onStar,
  onRender,
}: {
  row: TableRow;
  starred: boolean;
  onStar: (id: string) => void;
  onRender: (id: string) => void;
}) {
  onRender(row.id);
  return (
    <li>
      <span>
        {row.name}
        {starred ? " *" : ""}
      </span>
      <button type="button" onClick={() => onStar(row.id)}>
        Star {row.name}
      </button>
    </li>
  );
}

export function SortableTable({
  rows,
  onSort,
  onRowRender,
}: {
  rows: TableRow[];
  onSort: () => void;
  onRowRender: (id: string) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [descending, setDescending] = useState(false);
  const [starred, setStarred] = useState<Record<string, boolean>>({});

  onSort();
  const sorted = [...rows].sort((left, right) =>
    descending ? right.name.localeCompare(left.name) : left.name.localeCompare(right.name),
  );
  const visible = sorted.filter((row) => row.name.toLowerCase().includes(query.toLowerCase()));

  function star(rowId: string) {
    setStarred((current) => ({ ...current, [rowId]: !current[rowId] }));
  }

  return (
    <>
      <label htmlFor={id}>Filter</label>
      <input id={id} value={query} onChange={(event) => setQuery(event.target.value)} />
      <button type="button" onClick={() => setDescending((current) => !current)}>
        Sort by name
      </button>
      <ul>
        {visible.map((row) => (
          <Row
            key={row.id}
            row={row}
            starred={starred[row.id] ?? false}
            onStar={(rowId) => star(rowId)}
            onRender={onRowRender}
          />
        ))}
      </ul>
    </>
  );
}
