// d21_memoization / ex2 - reference solution.
import { memo, useCallback, useId, useState } from "react";

const ColumnFilter = memo(function ColumnFilter({
  name,
  onToggle,
  onRender,
}: {
  name: string;
  onToggle: () => void;
  onRender: () => void;
}) {
  onRender();
  return (
    <button type="button" onClick={onToggle}>
      Toggle {name}
    </button>
  );
});

export function ColumnBoard({ onFilterRender }: { onFilterRender: () => void }) {
  const id = useId();
  const [board, setBoard] = useState("");
  const [toggles, setToggles] = useState(0);

  // The updater form means this never has to read `toggles`, so its dependency
  // list is empty and the function is the same object for ever.
  const toggleStatus = useCallback(() => {
    setToggles((current) => current + 1);
  }, []);

  return (
    <>
      <label htmlFor={id}>Board name</label>
      <input id={id} value={board} onChange={(event) => setBoard(event.target.value)} />
      <p>Board: {board}</p>
      <p role="status">
        Status toggled {toggles} {toggles === 1 ? "time" : "times"}
      </p>
      <ColumnFilter name="Status" onToggle={toggleStatus} onRender={onFilterRender} />
    </>
  );
}
