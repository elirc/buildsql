// d22_render_performance / ex8 - reference solution.
import { memo, useCallback, useId, useMemo, useState } from "react";

export type TableRow = { id: string; name: string };

// Memoized, so a render of the table is not automatically a render of every
// row - which is only worth anything because all four props below are stable.
const Row = memo(function Row({
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
});

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

  // Two steps, two dependency lists. Sorting depends on the rows and the
  // direction; filtering depends on the sorted rows and the query. Typing
  // therefore cannot cost a sort.
  const sorted = useMemo(() => {
    onSort();
    return [...rows].sort((left, right) =>
      descending ? right.name.localeCompare(left.name) : left.name.localeCompare(right.name),
    );
  }, [rows, descending, onSort]);

  const visible = useMemo(
    () => sorted.filter((row) => row.name.toLowerCase().includes(query.toLowerCase())),
    [sorted, query],
  );

  // One handler for every row, and the row says which row it is.
  const star = useCallback((rowId: string) => {
    setStarred((current) => ({ ...current, [rowId]: !current[rowId] }));
  }, []);

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
            onStar={star}
            onRender={onRowRender}
          />
        ))}
      </ul>
    </>
  );
}
