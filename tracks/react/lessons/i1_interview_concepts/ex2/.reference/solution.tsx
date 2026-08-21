// i1_interview_concepts / ex2 - reference solution.
import { useState } from "react";

type Item = { id: string; label: string };

export function ReorderableList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);

  function sort() {
    setItems((previous) => [...previous].sort((a, b) => a.label.localeCompare(b.label)));
  }

  return (
    <>
      <button type="button" onClick={sort}>
        Sort A-Z
      </button>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <label htmlFor={item.id}>{item.label}</label>
            <input id={item.id} defaultValue="" />
          </li>
        ))}
      </ul>
    </>
  );
}
