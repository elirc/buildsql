// d12_fetching_states / ex4 - ask again, but only one question at a time.
// See tracks/react/lessons/d12_fetching_states/README.md, "Exercise 4".
import { useEffect, useState } from "react";

export function StockLevel({
  sku,
  fetchLevel,
}: {
  sku: string;
  fetchLevel: (sku: string) => Promise<number>;
}) {
  const [level, setLevel] = useState<number | null>(null);

  useEffect(() => {
    fetchLevel(sku).then(setLevel);
  }, [sku, fetchLevel]);

  return (
    <>
      <p>In stock: {level}</p>
      <button type="button" onClick={() => {}}>
        Refresh
      </button>
    </>
  );
}
