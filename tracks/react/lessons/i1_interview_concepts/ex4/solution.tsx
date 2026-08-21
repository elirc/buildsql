// i1_interview_concepts / ex4 - "what is wrong with this effect?"
// See tracks/react/lessons/i1_interview_concepts/README.md, "Exercise 4".
import { useEffect, useState } from "react";

type Item = { name: string; price: number };

export function OrderSummary({
  items,
  onRender,
}: {
  items: Item[];
  onRender: () => void;
}) {
  const [total, setTotal] = useState(0);

  onRender();

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price, 0));
  }, [items]);

  return <output>Total: {total}</output>;
}
