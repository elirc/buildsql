// d11_effects_cleanup / ex8 - one live subscription, and only when it is wanted.
// See tracks/react/lessons/d11_effects_cleanup/README.md, "Exercise 8".
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
    subscribe(source, setValue);
  }, [source, subscribe]);

  return <p role="status">{value === null ? "No data" : `${source}: ${value}`}</p>;
}
