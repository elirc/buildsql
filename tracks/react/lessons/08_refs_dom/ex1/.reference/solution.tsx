// 08_refs_dom / ex1 - reference solution.
import { useEffect, useRef } from "react";

export function AutoFocusInput({ label }: { label: string }) {
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    field.current?.focus();
  }, []);

  return (
    <>
      <label htmlFor="auto-focus">{label}</label>
      <input id="auto-focus" ref={field} />
    </>
  );
}
