// d04_state_basics / ex2 - reference solution.
import { useState } from "react";

export function Spoiler({ text }: { text: string }) {
  const [shown, setShown] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setShown(!shown)}>
        {shown ? "Hide spoiler" : "Show spoiler"}
      </button>
      {shown ? <p>{text}</p> : null}
    </>
  );
}
