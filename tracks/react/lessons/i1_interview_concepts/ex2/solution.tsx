// i1_interview_concepts / ex2 - "sort the list, then tell me what went wrong."
// See tracks/react/lessons/i1_interview_concepts/README.md, "Exercise 2".
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
        {items.map((item, index) => (
          <li key={index}>
            <label htmlFor={item.id}>{item.label}</label>
            <input id={item.id} defaultValue="" />
          </li>
        ))}
      </ul>
    </>
  );
}
