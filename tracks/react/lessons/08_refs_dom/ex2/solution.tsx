// 08_refs_dom / ex2 - a value that survives renders without causing them.
// See tracks/react/lessons/08_refs_dom/README.md, "Exercise 2".
//
// onRender() is the render-counting probe from lesson 03. It is already wired
// up; leave it alone.
import { useState } from "react";

export function ClickTracker({ onRender }: { onRender: () => void }) {
  const [shown, setShown] = useState<number | null>(null);

  onRender();

  return (
    <>
      <button type="button">Tap</button>
      <button type="button" onClick={() => setShown(0)}>
        Show total
      </button>
      {shown !== null && <output>{shown} taps</output>}
    </>
  );
}
