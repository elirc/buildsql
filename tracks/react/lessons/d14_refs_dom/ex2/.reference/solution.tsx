// d14_refs_dom / ex2 - reference solution.
import { useId, useRef } from "react";

export function PromoCode({ onApply }: { onApply: (code: string) => void }) {
  const id = useId();
  const box = useRef<HTMLInputElement>(null);

  function clear() {
    if (box.current === null) return;
    // The DOM owns this value, so clearing it means writing to the node. On a
    // controlled input this line would be a bug; here it is the only way.
    box.current.value = "";
    box.current.focus();
  }

  return (
    <>
      <label htmlFor={id}>Promo code</label>
      <input id={id} ref={box} />
      <button type="button" onClick={() => onApply(box.current?.value ?? "")}>
        Apply
      </button>
      <button type="button" onClick={clear}>
        Clear
      </button>
    </>
  );
}
