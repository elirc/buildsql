// 08_refs_dom / ex1 - a handle on a real DOM node.
// See tracks/react/lessons/08_refs_dom/README.md, "Exercise 1".

export function AutoFocusInput({ label }: { label: string }) {
  return (
    <>
      <label htmlFor="auto-focus">{label}</label>
      <input id="auto-focus" />
    </>
  );
}
