// d21_memoization / ex7 - a new handler per row, per render.
// See tracks/react/lessons/d21_memoization/README.md, "Exercise 7".
import { memo, useState } from "react";

export type ChecklistItem = { id: string; label: string };

const ChecklistRow = memo(function ChecklistRow({
  item,
  done,
  onToggle,
  onRender,
}: {
  item: ChecklistItem;
  done: boolean;
  onToggle: (id: string) => void;
  onRender: (id: string) => void;
}) {
  onRender(item.id);
  return (
    <li>
      <span>
        {item.label}: {done ? "done" : "to do"}
      </span>
      <button type="button" onClick={() => onToggle(item.id)}>
        Toggle {item.label}
      </button>
    </li>
  );
});

export function ChecklistRows({
  items,
  onRowRender,
}: {
  items: ChecklistItem[];
  onRowRender: (id: string) => void;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setDone((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <ul>
      {items.map((item) => (
        <ChecklistRow
          key={item.id}
          item={item}
          done={done[item.id] ?? false}
          onToggle={() => toggle(item.id)}
          onRender={onRowRender}
        />
      ))}
    </ul>
  );
}
