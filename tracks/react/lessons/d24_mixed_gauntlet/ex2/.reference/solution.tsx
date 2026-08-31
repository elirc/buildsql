// d24_mixed_gauntlet / ex2 - reference solution.
import { useState } from "react";

export function RosterBoard({ people }: { people: string[] }) {
  // One lead, so one value - not a flag per person that something has to
  // remember to clear. And it is the only thing worth storing: the order on
  // screen follows from it.
  const [lead, setLead] = useState<string | null>(null);

  // Derived during render, so a changed roster is reflected immediately and
  // nothing can drift out of step with the prop.
  const order =
    lead === null ? people : [lead, ...people.filter((person) => person !== lead)];

  if (people.length === 0) {
    // An empty list is a state with something to say.
    return <p role="status">Nobody on the roster</p>;
  }

  return (
    <>
      <ul>
        {order.map((person) => (
          // Keyed by the person, so React keeps each row's identity when the
          // order changes rather than rewriting them all in place.
          <li key={person}>
            <span>{person === lead ? `${person} (lead)` : person}</span>
            <button type="button" onClick={() => setLead(person)}>
              Promote {person}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setLead(null)}>
        Reset
      </button>
    </>
  );
}
