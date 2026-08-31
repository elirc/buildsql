// d06_lists_keys / ex4 - reference solution.
import { useState } from "react";

export function SortableRoster({ people }: { people: { id: string; name: string }[] }) {
  const [sorted, setSorted] = useState(false);
  const rows = sorted ? [...people].sort((a, b) => a.name.localeCompare(b.name)) : people;

  return (
    <>
      <button type="button" onClick={() => setSorted(true)}>
        Sort by name
      </button>
      <ul>
        {rows.map((person) => (
          <li key={person.id}>
            <label htmlFor={`note-${person.id}`}>{person.name}</label>
            <input id={`note-${person.id}`} defaultValue="" />
          </li>
        ))}
      </ul>
    </>
  );
}
