// d24_mixed_gauntlet / ex3 - timers + cleanup + the newest callback.
// See tracks/react/lessons/d24_mixed_gauntlet/README.md, "Exercise 3".
import { useEffect, useState } from "react";

export function IdleWatcher({
  timeoutMs,
  onIdle,
}: {
  timeoutMs: number;
  onIdle: () => void;
}) {
  const [idle, setIdle] = useState(false);
  const [activity, setActivity] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      setIdle(true);
      onIdle();
    }, timeoutMs);
    return () => clearTimeout(id);
  }, []);

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
