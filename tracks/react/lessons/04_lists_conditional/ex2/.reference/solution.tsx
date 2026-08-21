// 04_lists_conditional / ex2 - reference solution.
import { useState } from "react";

type Person = { id: string; name: string };

export function PeopleList({
  initialPeople,
  newcomer,
}: {
  initialPeople: Person[];
  newcomer: Person;
}) {
  const [people, setPeople] = useState(initialPeople);

  return (
    <>
      <button type="button" onClick={() => setPeople((previous) => [newcomer, ...previous])}>
        Add to front
      </button>
      <ul>
        {people.map((person) => (
          <li key={person.id}>
            <label htmlFor={person.id}>{person.name}</label>
            <input id={person.id} defaultValue="" />
          </li>
        ))}
      </ul>
    </>
  );
}
