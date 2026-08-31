// d10_effects_basics / ex3 - a total is not state.
// See tracks/react/lessons/d10_effects_basics/README.md, "Exercise 3".
import { useEffect, useState } from "react";

export function LiveTotal({ items, onRender }: { items: number[]; onRender: () => void }) {
  const [total, setTotal] = useState(0);

  onRender();

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item, 0));
  }, [items]);

  return <p role="status">Total: {total}</p>;
}
