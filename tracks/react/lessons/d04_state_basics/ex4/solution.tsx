// d04_state_basics / ex4 - a list in state, edited the wrong way.
// See tracks/react/lessons/d04_state_basics/README.md, "Exercise 4".
import { useState } from "react";

export function QueueBoard({ names }: { names: string[] }) {
  const [queue] = useState<string[]>([]);
  const next = queue.length > 0 ? queue[0] : "nobody";

  return (
    <>
      <p role="status">
        {queue.length} waiting - Next: {next}
      </p>
      <button
        type="button"
        onClick={() => {
          queue.push(names[queue.length]);
        }}
        disabled={queue.length >= names.length}
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => {
          queue.shift();
        }}
        disabled={queue.length === 0}
      >
        Remove first
      </button>
    </>
  );
}
