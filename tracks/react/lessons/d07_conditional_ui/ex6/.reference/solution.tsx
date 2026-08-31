// d07_conditional_ui / ex6 - reference solution.

export function SaveButton({ dirty, saving }: { dirty: boolean; saving: boolean }) {
  return (
    <button
      type="button"
      disabled={saving || !dirty}
      aria-busy={saving ? "true" : undefined}
    >
      {saving ? "Saving" : "Save"}
    </button>
  );
}
