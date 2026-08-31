// d22_render_performance / ex5 - reference solution.
import { useState } from "react";

export function SelectionBar({
  options,
  onRender,
}: {
  options: string[];
  onRender: () => void;
}) {
  onRender();
  // The choice is a name, so store a name. React compares the next state with
  // the current one using Object.is and does nothing at all when they match -
  // an object wrapper throws that away for no benefit.
  const [selected, setSelected] = useState(options[0]);

  return (
    <>
      <p role="status">Selected: {selected}</p>
      {options.map((option) => (
        <button key={option} type="button" onClick={() => setSelected(option)}>
          Pick {option}
        </button>
      ))}
    </>
  );
}
