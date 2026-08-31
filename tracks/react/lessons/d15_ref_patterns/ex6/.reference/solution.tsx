// d15_ref_patterns / ex6 - reference solution.
import { useId, useRef, type Ref } from "react";

export function PassphraseBox({ label, ref }: { label: string; ref?: Ref<HTMLInputElement> }) {
  const id = useId();
  // The component's own handle on the node. It exists whether or not a parent
  // asked for one, which is what makes Clear work in both cases.
  const inner = useRef<HTMLInputElement>(null);

  // A callback ref can feed more than one consumer: ours, and whatever the
  // parent passed - which may be a function ref, an object ref, or nothing.
  function attach(node: HTMLInputElement | null) {
    inner.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref !== undefined && ref !== null) {
      ref.current = node;
    }
  }

  function clear() {
    if (inner.current === null) return;
    inner.current.value = "";
    inner.current.focus();
  }

  return (
    <p>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" ref={attach} />
      <button type="button" onClick={clear}>
        Clear {label}
      </button>
    </p>
  );
}
