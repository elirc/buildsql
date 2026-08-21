// 10_custom_hooks / ex4 - this component breaks the rules of hooks.
// See tracks/react/lessons/10_custom_hooks/README.md, "Exercise 4".
import { useId, useState } from "react";

export function VisitorPanel({ signedIn }: { signedIn: boolean }) {
  const headingId = useId();

  if (!signedIn) {
    return <p>Please sign in</p>;
  }

  const [claps, setClaps] = useState(0);

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>Your claps</h2>
      <output>{claps} claps</output>
      <button type="button" onClick={() => setClaps((previous) => previous + 1)}>
        Clap
      </button>
    </section>
  );
}
