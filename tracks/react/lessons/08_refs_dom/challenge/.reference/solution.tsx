// 08_refs_dom / challenge - reference solution.
import { useId, useImperativeHandle, useRef, useState } from "react";
import type { Ref } from "react";

export type EditorHandle = {
  focus: () => void;
  clear: () => void;
};

export function Editor({ label, ref }: { label: string; ref?: Ref<EditorHandle> }) {
  const id = useId();
  const [text, setText] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => field.current?.focus(),
      clear: () => setText(""),
    }),
    [],
  );

  return (
    <>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        ref={field}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </>
  );
}
