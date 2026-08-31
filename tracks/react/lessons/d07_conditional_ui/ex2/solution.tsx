// d07_conditional_ui / ex2 - the badge that should not be there.
// See tracks/react/lessons/d07_conditional_ui/README.md, "Exercise 2".

export function CartBadge({ count }: { count: number }) {
  return <>{count && <span role="status">{count}</span>}</>;
}
