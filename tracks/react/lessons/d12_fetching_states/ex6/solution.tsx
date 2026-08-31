// d12_fetching_states / ex6 - do not blank the screen to say you are checking.
// See tracks/react/lessons/d12_fetching_states/README.md, "Exercise 6".
import { useEffect, useState } from "react";

export function RateBoard({
  pair,
  fetchRate,
}: {
  pair: string;
  fetchRate: (pair: string) => Promise<string>;
}) {
  const [rate, setRate] = useState<string | null>(null);

  useEffect(() => {
    setRate(null);
    fetchRate(pair).then(setRate);
  }, [pair, fetchRate]);

  return (
    <div role="region" aria-label="Exchange rate" aria-busy={rate === null}>
      {rate === null ? "Loading rates" : rate}
    </div>
  );
}
