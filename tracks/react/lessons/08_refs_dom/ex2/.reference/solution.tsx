// 08_refs_dom / ex2 - reference solution.
import { useRef, useState } from "react";

export function ClickTracker({ onRender }: { onRender: () => void }) {
  const taps = useRef(0);
  const [shown, setShown] = useState<number | null>(null);

  onRender();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          taps.current += 1;
        }}
      >
        Tap
      </button>
      <button type="button" onClick={() => setShown(taps.current)}>
        Show total
      </button>
      {shown !== null && <output>{shown} taps</output>}
    </>
  );
}
