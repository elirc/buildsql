// d07_conditional_ui / ex6 - the condition lands on attributes, not on elements.
// See tracks/react/lessons/d07_conditional_ui/README.md, "Exercise 6".

export function SaveButton({ dirty, saving }: { dirty: boolean; saving: boolean }) {
  return saving ? (
    <button type="button" aria-busy="true">
      Saving
    </button>
  ) : (
    <button type="button">Save</button>
  );
}
