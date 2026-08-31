// d22_render_performance / ex7 - reference solution.
import { useId, useState } from "react";

function LeftPanel({ onRender }: { onRender: () => void }) {
  onRender();
  return <p>Left panel</p>;
}

function RightPanel({ onRender }: { onRender: () => void }) {
  onRender();
  return <p>Right panel</p>;
}

// Each piece of state moves to the smallest component that needs it, together
// with everything that displays it.
function TickCounter() {
  const [ticks, setTicks] = useState(0);
  return (
    <>
      <p role="status">Ticks: {ticks}</p>
      <button type="button" onClick={() => setTicks((current) => current + 1)}>
        Tick
      </button>
    </>
  );
}

function SearchBox() {
  const id = useId();
  const [search, setSearch] = useState("");
  return (
    <>
      <label htmlFor={id}>Search</label>
      <input id={id} value={search} onChange={(event) => setSearch(event.target.value)} />
      <p>Searching for {search}</p>
    </>
  );
}

export function DashboardShell({
  onLeftRender,
  onRightRender,
}: {
  onLeftRender: () => void;
  onRightRender: () => void;
}) {
  // Nothing left here that can change, so nothing left that can cause a
  // render - which is a stronger guarantee than any memo, and one that cannot
  // rot when somebody adds a prop later.
  return (
    <>
      <TickCounter />
      <SearchBox />
      <LeftPanel onRender={onLeftRender} />
      <RightPanel onRender={onRightRender} />
    </>
  );
}
