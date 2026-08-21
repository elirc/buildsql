// 11_performance_patterns / ex2 - reference solution.
import { memo, useCallback, useState } from "react";

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

  const handleSelect = useCallback((value: string) => {
    setPicked(value);
  }, []);

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
