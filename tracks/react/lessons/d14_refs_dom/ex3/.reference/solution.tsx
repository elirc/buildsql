// d14_refs_dom / ex3 - reference solution.
import { useId, type Ref } from "react";

export function IconField({ label, ref }: { label: string; ref?: Ref<HTMLInputElement> }) {
  const id = useId();

  return (
    <p>
      <span aria-hidden="true">#</span>
      <label htmlFor={id}>{label}</label>
      {/* In React 19 `ref` is an ordinary prop, so forwarding it is just
          passing it on to the node the parent meant. Nothing else is needed:
          no forwardRef, no ref of our own. */}
      <input id={id} ref={ref} />
    </p>
  );
}
