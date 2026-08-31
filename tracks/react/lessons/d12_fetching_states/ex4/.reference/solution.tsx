// d12_fetching_states / ex4 - reference solution.
import { useEffect, useState } from "react";

export function StockLevel({
  sku,
  fetchLevel,
}: {
  sku: string;
  fetchLevel: (sku: string) => Promise<number>;
}) {
  const [level, setLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchLevel(sku).then((value) => {
      setLevel(value);
      setLoading(false);
    });
  }, [sku, fetchLevel, attempt]);

  return (
    <>
      {level === null ? <p role="status">Checking stock</p> : <p>In stock: {level}</p>}
      <button type="button" disabled={loading} onClick={() => setAttempt((n) => n + 1)}>
        Refresh
      </button>
    </>
  );
}
