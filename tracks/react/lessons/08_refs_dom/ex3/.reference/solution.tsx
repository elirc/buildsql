// 08_refs_dom / ex3 - reference solution.
import type { Ref } from "react";

export function FancyInput({ label, ref }: { label: string; ref?: Ref<HTMLInputElement> }) {
  return (
    <>
      <label htmlFor="fancy">{label}</label>
      <input id="fancy" className="fancy" ref={ref} />
    </>
  );
}
