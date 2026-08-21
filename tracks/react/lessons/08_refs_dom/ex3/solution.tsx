// 08_refs_dom / ex3 - passing a ref through a component.
// See tracks/react/lessons/08_refs_dom/README.md, "Exercise 3".
import type { Ref } from "react";

export function FancyInput({ label, ref }: { label: string; ref?: Ref<HTMLInputElement> }) {
  return (
    <>
      <label htmlFor="fancy">{label}</label>
      <input id="fancy" className="fancy" />
    </>
  );
}
