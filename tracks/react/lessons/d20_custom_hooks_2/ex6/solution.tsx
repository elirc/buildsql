// d20_custom_hooks_2 / ex6 - a poll that fires whether or not the last one answered.
// See tracks/react/lessons/d20_custom_hooks_2/README.md, "Exercise 6".
import { useEffect, useState } from "react";

export function useIntervalPoll<T>(load: () => Promise<T>, everyMs: number) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    function poll() {
      load().then((next) => setData(next));
    }

    poll();
    setInterval(poll, everyMs);
  }, [everyMs, load]);

  return { data };
}
