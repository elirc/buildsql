// d10_effects_basics / ex3 - reference solution.

export function LiveTotal({ items, onRender }: { items: number[]; onRender: () => void }) {
  onRender();

  const total = items.reduce((sum, item) => sum + item, 0);

  return <p role="status">Total: {total}</p>;
}
