// 11_performance_patterns / ex2 - a memoized child that re-renders anyway.
// See tracks/react/lessons/11_performance_patterns/README.md, "Exercise 2".
import { memo, useState } from "react";

// Already memoized. You do not need to change this component.
const Child = memo(function Child({
  onSelect,
  onChildRender,
}: {
  onSelect: (value: string) => void;
  onChildRender: () => void;
}) {
  onChildRender();
  return (
    <button type="button" onClick={() => onSelect("apple")}>
      Pick
    </button>
  );
});

export function Parent({ onChildRender }: { onChildRender: () => void }) {
  const [clicks, setClicks] = useState(0);
  const [picked, setPicked] = useState("nothing");

  function handleSelect(value: string) {
    setPicked(value);
  }

  return (
    <>
      <output>
        {clicks} clicks, picked {picked}
      </output>
      <button type="button" onClick={() => setClicks((previous) => previous + 1)}>
        Bump
      </button>
      <Child onSelect={handleSelect} onChildRender={onChildRender} />
    </>
  );
}
