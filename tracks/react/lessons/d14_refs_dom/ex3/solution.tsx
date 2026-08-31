// d14_refs_dom / ex3 - the ref the parent gave you is a prop like any other.
// See tracks/react/lessons/d14_refs_dom/README.md, "Exercise 3".
import { useId, useRef, type Ref } from "react";

export function IconField({ label, ref }: { label: string; ref?: Ref<HTMLInputElement> }) {
  const id = useId();
  const inner = useRef<HTMLInputElement>(null);

  return (
    <p>
      <span aria-hidden="true">#</span>
      <label htmlFor={id}>{label}</label>
      <input id={id} ref={inner} />
    </p>
  );
}
