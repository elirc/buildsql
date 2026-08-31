// d20_custom_hooks_2 / ex6 - reference solution.
import { useEffect, useRef, useState } from "react";

export function useIntervalPoll<T>(load: () => Promise<T>, everyMs: number) {
  const [data, setData] = useState<T | null>(null);

  // The newest loader, so a caller writing `load` inline does not restart the
  // polling on every render.
  const latest = useRef(load);
  useEffect(() => {
    latest.current = load;
  });

  // Not state: nothing on screen depends on it, and changing it must not
  // render. It also has to be readable the instant a tick happens.
  const inFlight = useRef(false);

  useEffect(() => {
    let alive = true;

    function poll() {
      if (inFlight.current) return;
      inFlight.current = true;
      latest.current().then(
        (next) => {
          inFlight.current = false;
          if (alive) setData(next);
        },
        () => {
          inFlight.current = false;
        },
      );
    }

    poll();
    const id = setInterval(poll, everyMs);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [everyMs]);

  return { data };
}
