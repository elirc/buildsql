// d04_state_basics / ex4 - reference solution.
import { useState } from "react";

export function QueueBoard({ names }: { names: string[] }) {
  const [queue, setQueue] = useState<string[]>([]);
  const next = queue.length > 0 ? queue[0] : "nobody";

  return (
    <>
      <p role="status">
        {queue.length} waiting - Next: {next}
      </p>
      <button
        type="button"
        onClick={() => setQueue((current) => [...current, names[current.length]])}
        disabled={queue.length >= names.length}
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setQueue((current) => current.slice(1))}
        disabled={queue.length === 0}
      >
        Remove first
      </button>
    </>
  );
}
