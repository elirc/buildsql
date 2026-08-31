// d11_effects_cleanup / ex8 - reference solution.
import { useEffect, useState } from "react";

type Subscribe = (source: string, onValue: (value: number) => void) => () => void;

export function LiveTicker({
  source,
  paused,
  subscribe,
}: {
  source: string;
  paused: boolean;
  subscribe: Subscribe;
}) {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    if (paused) {
      return;
    }
    setValue(null);
    return subscribe(source, setValue);
  }, [source, paused, subscribe]);

  return <p role="status">{value === null ? "No data" : `${source}: ${value}`}</p>;
}
