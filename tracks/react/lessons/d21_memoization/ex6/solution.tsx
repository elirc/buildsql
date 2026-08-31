// d21_memoization / ex6 - children is a prop, and it is new every render.
// See tracks/react/lessons/d21_memoization/README.md, "Exercise 6".
import { memo, useState, type ReactNode } from "react";

const Frame = memo(function Frame({
  title,
  children,
  onRender,
}: {
  title: string;
  children: ReactNode;
  onRender: () => void;
}) {
  onRender();
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
});

function Body({ onRender }: { onRender: () => void }) {
  onRender();
  return <p>Nothing to report</p>;
}

export function FrameBoard({
  onFrameRender,
  onBodyRender,
}: {
  onFrameRender: () => void;
  onBodyRender: () => void;
}) {
  const [ticks, setTicks] = useState(0);

  return (
    <>
      <p role="status">Ticks: {ticks}</p>
      <button type="button" onClick={() => setTicks((current) => current + 1)}>
        Tick
      </button>
      <Frame title="Summary" onRender={onFrameRender}>
        <Body onRender={onBodyRender} />
      </Frame>
    </>
  );
}
