// d07_conditional_ui / ex7 - what it says and what it draws are two decisions.
// See tracks/react/lessons/d07_conditional_ui/README.md, "Exercise 7".

export function ReviewQueueTab({ count, snoozed }: { count: number; snoozed: boolean }) {
  return (
    <button type="button" aria-label={`${count} reviews waiting`}>
      <span aria-hidden="true">{count}</span>
    </button>
  );
}
