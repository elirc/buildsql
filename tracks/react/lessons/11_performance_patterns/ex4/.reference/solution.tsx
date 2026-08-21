// 11_performance_patterns / ex4 - reference solution.
import { useState } from "react";

function ExpensiveList({ onExpensiveRender }: { onExpensiveRender: () => void }) {
  onExpensiveRender();
  return (
    <ul>
      <li>Everything</li>
      <li>Else</li>
    </ul>
  );
}

// The note's state now lives with the only things that use it, so typing
// re-renders NoteField and nothing else.
function NoteField() {
  const [note, setNote] = useState("");

  return (
    <>
      <label htmlFor="note">Note</label>
      <input id="note" value={note} onChange={(event) => setNote(event.target.value)} />
      <output>{note}</output>
    </>
  );
}

export function Dashboard({ onExpensiveRender }: { onExpensiveRender: () => void }) {
  return (
    <>
      <NoteField />
      <ExpensiveList onExpensiveRender={onExpensiveRender} />
    </>
  );
}
