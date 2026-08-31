// d07_conditional_ui / ex2 - reference solution.

export function CartBadge({ count }: { count: number }) {
  if (count === 0) {
    return null;
  }

  return <span role="status">{count}</span>;
}
