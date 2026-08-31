// d07_conditional_ui / ex7 - reference solution.

export function ReviewQueueTab({ count, snoozed }: { count: number; snoozed: boolean }) {
  const label = snoozed
    ? "Reviews snoozed"
    : count === 0
      ? "No reviews waiting"
      : `${count} review${count === 1 ? "" : "s"} waiting`;

  const badge = snoozed || count === 0 ? null : count > 9 ? "9+" : String(count);

  return (
    <button type="button" aria-label={label}>
      {badge !== null && <span aria-hidden="true">{badge}</span>}
    </button>
  );
}
