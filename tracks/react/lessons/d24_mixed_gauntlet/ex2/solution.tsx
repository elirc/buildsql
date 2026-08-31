// d24_mixed_gauntlet / ex2 - list state + immutable updates + the empty case.
// See tracks/react/lessons/d24_mixed_gauntlet/README.md, "Exercise 2".
import { useState } from "react";

export function RosterBoard({ people }: { people: string[] }) {
  const [order, setOrder] = useState(people);
  const [leads, setLeads] = useState<string[]>([]);

  function promote(person: string) {
    setLeads((current) => [...current, person]);
  }

  return (
    <>
      <ul>
        {order.map((person) => (
          <li key={person}>
            <span>{leads.includes(person) ? `${person} (lead)` : person}</span>
            <button type="button" onClick={() => promote(person)}>
              Promote {person}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setLeads([])}>
        Reset
      </button>
    </>
  );
}
