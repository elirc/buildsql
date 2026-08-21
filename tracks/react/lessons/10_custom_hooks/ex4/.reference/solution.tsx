// 10_custom_hooks / ex4 - reference solution.
import { useId, useState } from "react";

export function VisitorPanel({ signedIn }: { signedIn: boolean }) {
  const headingId = useId();
  const [claps, setClaps] = useState(0);

  if (!signedIn) {
    return <p>Please sign in</p>;
  }

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
