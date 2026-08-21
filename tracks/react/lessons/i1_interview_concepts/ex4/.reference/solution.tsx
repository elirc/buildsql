// i1_interview_concepts / ex4 - reference solution.

type Item = { name: string; price: number };

export function OrderSummary({
  items,
  onRender,
}: {
  items: Item[];
  onRender: () => void;
}) {
  onRender();

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return <output>Total: {total}</output>;
}
