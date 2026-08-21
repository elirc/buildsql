// 08_refs_dom / challenge - exposing an imperative handle on purpose.
// See tracks/react/lessons/08_refs_dom/README.md, "Challenge".
import { useId, useState } from "react";
import type { Ref } from "react";

export type EditorHandle = {
  focus: () => void;
  clear: () => void;
};

export function Editor({ label, ref }: { label: string; ref?: Ref<EditorHandle> }) {
  const id = useId();
  const [text, setText] = useState("");

  return (
    <>
      <label htmlFor={id}>{label}</label>
      <textarea id={id} value={text} onChange={(event) => setText(event.target.value)} />
    </>
  );
}
