// d22_render_performance / ex1 - reference solution.
import { useState, type ReactNode } from "react";

function HeavyPanel({ onRender }: { onRender: () => void }) {
  onRender();
  return <p>Panel contents</p>;
}

// The ticker no longer knows what it is wrapping. Its state changes, it
// re-renders, and `children` is the very same element object it was handed
// last time - so React has nothing to do with that subtree.
function Ticker({ children }: { children: ReactNode }) {
  const [ticks, setTicks] = useState(0);

  return (
    <>
      <p role="status">Ticks: {ticks}</p>
      <button type="button" onClick={() => setTicks((current) => current + 1)}>
        Tick
      </button>
      {children}
    </>
  );
}

export function TickerPage({ onPanelRender }: { onPanelRender: () => void }) {
  // The element is created here, in a component that has no state at all and
  // therefore never re-renders on its own.
  return (
    <Ticker>
      <HeavyPanel onRender={onPanelRender} />
    </Ticker>
  );
}
