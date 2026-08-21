// i3_interview_rapidfire / ex3 - reference solution.
import { useState } from "react";

export function TripleBump({ onRender }: { onRender: () => void }) {
  const [count, setCount] = useState(0);

  onRender();

  function addThree() {
    setCount((previous) => previous + 1);
    setCount((previous) => previous + 1);
    setCount((previous) => previous + 1);
  }

  return (
    <>
      <output>{count}</output>
      <button type="button" onClick={addThree}>
        Add three
      </button>
    </>
  );
}
