// d14_refs_dom / ex2 - state and an uncontrolled input are two different boxes.
// See tracks/react/lessons/d14_refs_dom/README.md, "Exercise 2".
import { useId, useState } from "react";

export function PromoCode({ onApply }: { onApply: (code: string) => void }) {
  const id = useId();
  const [code, setCode] = useState("");

  return (
    <>
      <label htmlFor={id}>Promo code</label>
      <input id={id} defaultValue={code} />
      <button type="button" onClick={() => onApply(code)}>
        Apply
      </button>
      <button type="button" onClick={() => setCode("")}>
        Clear
      </button>
    </>
  );
}
