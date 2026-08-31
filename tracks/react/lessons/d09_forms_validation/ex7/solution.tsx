// d09_forms_validation / ex7 - a rule only the server knows the answer to.
// See tracks/react/lessons/d09_forms_validation/README.md, "Exercise 7".
import { useState } from "react";

export function HandleField({
  checkAvailable,
}: {
  checkAvailable: (handle: string) => Promise<boolean>;
}) {
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");

  async function handleChange(next: string) {
    setHandle(next);
    const free = await checkAvailable(next);
    setError(free ? "" : "That handle is taken");
  }

  return (
    <>
      <label htmlFor="handle">Handle</label>
      <input
        id="handle"
        value={handle}
        onChange={(event) => void handleChange(event.target.value)}
        aria-invalid={error === "" ? "false" : "true"}
        aria-describedby={error === "" ? undefined : "handle-error"}
      />
      {error !== "" && <p id="handle-error">{error}</p>}
      <p role="status" />
      <button type="button">Save</button>
    </>
  );
}
