// d15_ref_patterns / ex6 - a component that only works when it is given a ref.
// See tracks/react/lessons/d15_ref_patterns/README.md, "Exercise 6".
import { useId, type Ref } from "react";

export function PassphraseBox({ label, ref }: { label: string; ref?: Ref<HTMLInputElement> }) {
  const id = useId();

  function clear() {
    if (ref !== undefined && ref !== null && typeof ref !== "function") {
      if (ref.current === null) return;
      ref.current.value = "";
      ref.current.focus();
    }
  }

  return (
    <p>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" ref={ref} />
      <button type="button" onClick={clear}>
        Clear {label}
      </button>
    </p>
  );
}
