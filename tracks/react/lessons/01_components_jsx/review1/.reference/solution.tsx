// 01_components_jsx / review1 - reference solution.

export function Field({ id, label, hint }: { id: string; label: string; hint: string }) {
  const hintId = `${id}-hint`;
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-describedby={hintId} />
      <span id={hintId}>{hint}</span>
    </>
  );
}
