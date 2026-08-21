// i3_interview_rapidfire / ex4 - memo, and the prop that defeats it.
// See tracks/react/lessons/i3_interview_rapidfire/README.md, "Round 4".
import { memo, useState } from "react";

// Already memoized. Do not change this component.
const Body = memo(function Body({
  style,
  onBodyRender,
}: {
  style: { padding: number };
  onBodyRender: () => void;
}) {
  onBodyRender();
  return <p style={style}>Body</p>;
});

export function Panel({ onBodyRender }: { onBodyRender: () => void }) {
  const [open, setOpen] = useState(false);

  const style = { padding: 8 };

  return (
    <>
      <button type="button" onClick={() => setOpen((previous) => !previous)}>
        Toggle
      </button>
      <output>{open ? "open" : "closed"}</output>
      <Body style={style} onBodyRender={onBodyRender} />
    </>
  );
}
