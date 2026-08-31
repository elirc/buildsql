// d06_lists_keys / ex8 - reference solution.
import { useState } from "react";

export function SearchableChecklist({ items }: { items: { id: string; label: string }[] }) {
  const [filter, setFilter] = useState("");
  const visible = items.filter((item) =>
    item.label.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <>
      <label>
        Filter
        <input value={filter} onChange={(event) => setFilter(event.target.value)} />
      </label>
      <ul>
        {visible.map((item) => (
          <li key={item.id}>
            <label>
              {item.label}
              <input type="checkbox" />
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}
