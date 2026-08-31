// d06_lists_keys / ex8 - filtering a list of uncontrolled checkboxes.
// See tracks/react/lessons/d06_lists_keys/README.md, "Exercise 8".
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
        {visible.map((item, index) => (
          <li key={index}>
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
