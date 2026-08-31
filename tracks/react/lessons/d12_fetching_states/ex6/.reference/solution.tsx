// d12_fetching_states / ex6 - reference solution.
import { useEffect, useState } from "react";

export function RateBoard({
  pair,
  fetchRate,
}: {
  pair: string;
  fetchRate: (pair: string) => Promise<string>;
}) {
  const [rate, setRate] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setBusy(true);
    fetchRate(pair).then((value) => {
      setRate(value);
      setBusy(false);
    });
  }, [pair, fetchRate]);

  return (
    <div role="region" aria-label="Exchange rate" aria-busy={busy}>
      {rate === null ? "Loading rates" : rate}
    </div>
  );
}
