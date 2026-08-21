// 11_performance_patterns / ex4 - the fix that is not memoization.
// See tracks/react/lessons/11_performance_patterns/README.md, "Exercise 4".
import { useState } from "react";

// Pretend this renders ten thousand rows. Leave it exactly as it is - it is
// not memoized, and it does not need to be.
function ExpensiveList({ onExpensiveRender }: { onExpensiveRender: () => void }) {
  onExpensiveRender();
  return (
    <ul>
      <li>Everything</li>
      <li>Else</li>
    </ul>
  );
}

export function Dashboard({ onExpensiveRender }: { onExpensiveRender: () => void }) {
  const [note, setNote] = useState("");

  return (
    <>
      <label htmlFor="note">Note</label>
      <input id="note" value={note} onChange={(event) => setNote(event.target.value)} />
      <output>{note}</output>
      <ExpensiveList onExpensiveRender={onExpensiveRender} />
    </>
  );
}
