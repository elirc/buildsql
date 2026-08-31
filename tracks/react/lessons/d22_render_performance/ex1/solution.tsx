// d22_render_performance / ex1 - a component that renders what it also disturbs.
// See tracks/react/lessons/d22_render_performance/README.md, "Exercise 1".
import { useState } from "react";

function HeavyPanel({ onRender }: { onRender: () => void }) {
  onRender();
  return <p>Panel contents</p>;
}

function Ticker({ onPanelRender }: { onPanelRender: () => void }) {
  const [ticks, setTicks] = useState(0);

  return (
    <>
      <p role="status">Ticks: {ticks}</p>
      <button type="button" onClick={() => setTicks((current) => current + 1)}>
        Tick
      </button>
      <HeavyPanel onRender={onPanelRender} />
    </>
  );
}

export function TickerPage({ onPanelRender }: { onPanelRender: () => void }) {
  return <Ticker onPanelRender={onPanelRender} />;
}
