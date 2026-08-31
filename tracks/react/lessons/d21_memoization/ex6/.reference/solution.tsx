// d21_memoization / ex6 - reference solution.
import { memo, useMemo, useState, type ReactNode } from "react";

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

  // JSX is an object, and `<Body />` written inline builds a new one on every
  // render - which arrives at Frame as a changed `children` prop. Memoizing
  // the element is what makes the memo on Frame mean anything.
  const body = useMemo(() => <Body onRender={onBodyRender} />, [onBodyRender]);

  return (
    <>
      <p role="status">Ticks: {ticks}</p>
      <button type="button" onClick={() => setTicks((current) => current + 1)}>
        Tick
      </button>
      <Frame title="Summary" onRender={onFrameRender}>
        {body}
      </Frame>
    </>
  );
}
