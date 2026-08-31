// d15_ref_patterns / ex8 - a handle built once, over state that keeps moving.
// See tracks/react/lessons/d15_ref_patterns/README.md, "Exercise 8".
import { useId, useImperativeHandle, useState, type Ref } from "react";

export type PadHandle = {
  read: () => string;
  insert: (extra: string) => void;
  clear: () => void;
};

export function ScratchPad({ label, ref }: { label: string; ref?: Ref<PadHandle> }) {
  const id = useId();
  const [text, setText] = useState("");

  useImperativeHandle(
    ref,
    (): PadHandle => ({
      read: () => text,
      insert: (extra) => setText(text + extra),
      clear: () => setText(""),
    }),
    [],
  );

  return (
    <>
      <label htmlFor={id}>{label}</label>
      <textarea id={id} value={text} onChange={(event) => setText(event.target.value)} />
    </>
  );
}
