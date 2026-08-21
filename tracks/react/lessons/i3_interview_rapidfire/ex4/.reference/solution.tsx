// i3_interview_rapidfire / ex4 - reference solution.
import { memo, useState } from "react";

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

// Built once, for the module, so its identity never changes.
const BODY_STYLE = { padding: 8 };

export function Panel({ onBodyRender }: { onBodyRender: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen((previous) => !previous)}>
        Toggle
      </button>
      <output>{open ? "open" : "closed"}</output>
      <Body style={BODY_STYLE} onBodyRender={onBodyRender} />
    </>
  );
}
