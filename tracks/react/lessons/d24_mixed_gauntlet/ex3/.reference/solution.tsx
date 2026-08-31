// d24_mixed_gauntlet / ex3 - reference solution.
import { useEffect, useRef, useState } from "react";

export function IdleWatcher({
  timeoutMs,
  onIdle,
}: {
  timeoutMs: number;
  onIdle: () => void;
}) {
  const [idle, setIdle] = useState(false);
  // A counter, not a timestamp: all this needs to say is "something happened
  // again", which is exactly what a changed dependency means.
  const [activity, setActivity] = useState(0);

  // The newest callback, so restarting the clock does not depend on the parent
  // keeping its function identity stable.
  const latest = useRef(onIdle);
  useEffect(() => {
    latest.current = onIdle;
  });

  useEffect(() => {
    // Nothing to count once it has gone idle - and this is what leaves no
    // timer behind at the end.
    if (idle) return;

    const id = setTimeout(() => {
      setIdle(true);
      latest.current();
    }, timeoutMs);

    // Runs before every restart and once on the way out, which is the whole
    // of "the clock starts again when something happens".
    return () => clearTimeout(id);
  }, [activity, timeoutMs, idle]);

  return (
    <>
      <p role="status">{idle ? "Idle" : "Active"}</p>
      <button
        type="button"
        onClick={() => {
          setIdle(false);
          setActivity((current) => current + 1);
        }}
      >
        Activity
      </button>
    </>
  );
}
