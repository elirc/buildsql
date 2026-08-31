// d21_memoization / ex7 - reference solution.
import { memo, useCallback, useState } from "react";

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
      {/* The row knows which row it is, so it can say so when it calls back.
          That is what lets every row share one handler. */}
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

  // One function for the whole list, built once. An arrow inside the map would
  // be a new function per row per render, and every memoized row would then be
  // a comparison that can never succeed.
  const toggle = useCallback((id: string) => {
    setDone((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  return (
    <ul>
      {items.map((item) => (
        <ChecklistRow
          key={item.id}
          item={item}
          done={done[item.id] ?? false}
          onToggle={toggle}
          onRender={onRowRender}
        />
      ))}
    </ul>
  );
}
