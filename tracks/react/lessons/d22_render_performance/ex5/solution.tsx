// d22_render_performance / ex5 - a new object for a choice that did not change.
// See tracks/react/lessons/d22_render_performance/README.md, "Exercise 5".
import { useState } from "react";

export function SelectionBar({
  options,
  onRender,
}: {
  options: string[];
  onRender: () => void;
}) {
  onRender();
  const [selected, setSelected] = useState({ name: options[0] });

  return (
    <>
      <p role="status">Selected: {selected.name}</p>
      {options.map((option) => (
        <button key={option} type="button" onClick={() => setSelected({ name: option })}>
          Pick {option}
        </button>
      ))}
    </>
  );
}
