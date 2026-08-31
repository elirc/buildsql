// d22_render_performance / ex7 - a shell that owns everybody else's state.
// See tracks/react/lessons/d22_render_performance/README.md, "Exercise 7".
import { useId, useState } from "react";

function LeftPanel({ onRender }: { onRender: () => void }) {
  onRender();
  return <p>Left panel</p>;
}

function RightPanel({ onRender }: { onRender: () => void }) {
  onRender();
  return <p>Right panel</p>;
}

export function DashboardShell({
  onLeftRender,
  onRightRender,
}: {
  onLeftRender: () => void;
  onRightRender: () => void;
}) {
  const id = useId();
  const [ticks, setTicks] = useState(0);
  const [search, setSearch] = useState("");

  return (
    <>
      <p role="status">Ticks: {ticks}</p>
      <button type="button" onClick={() => setTicks((current) => current + 1)}>
        Tick
      </button>
      <label htmlFor={id}>Search</label>
      <input id={id} value={search} onChange={(event) => setSearch(event.target.value)} />
      <p>Searching for {search}</p>
      <LeftPanel onRender={onLeftRender} />
      <RightPanel onRender={onRightRender} />
    </>
  );
}
