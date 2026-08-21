// 01_components_jsx / review1 - fragments, htmlFor, and id-based wiring.
// See tracks/react/lessons/01_components_jsx/README.md, "Review".

export function Field({ id, label, hint }: { id: string; label: string; hint: string }) {
  return <input id={id} />;
}
