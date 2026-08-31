// d15_ref_patterns / ex8 - reference solution.
import { useId, useImperativeHandle, useState, type Ref } from "react";

export type PadHandle = {
  read: () => string;
  insert: (extra: string) => void;
  clear: () => void;
};

export function ScratchPad({ label, ref }: { label: string; ref?: Ref<PadHandle> }) {
  const id = useId();
  const [text, setText] = useState("");

  // The factory closes over `text`, so the handle has to be rebuilt when the
  // text changes - exactly the rule a dependency array always states. The
  // updaters use the functional form and would be fine on their own; `read`
  // is the one that has no other way of seeing the present.
  useImperativeHandle(
    ref,
    (): PadHandle => ({
      read: () => text,
      insert: (extra) => setText((current) => current + extra),
      clear: () => setText(""),
    }),
    [text],
  );

  return (
    <>
      <label htmlFor={id}>{label}</label>
      <textarea id={id} value={text} onChange={(event) => setText(event.target.value)} />
    </>
  );
}
