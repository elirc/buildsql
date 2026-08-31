// d09_forms_validation / ex7 - reference solution.
import { useState } from "react";

export function HandleField({
  checkAvailable,
}: {
  checkAvailable: (handle: string) => Promise<boolean>;
}) {
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [available, setAvailable] = useState(false);

  async function check() {
    const asked = handle.trim();
    if (asked === "") {
      return;
    }
    setStatus("Checking");
    setError("");
    setAvailable(false);

    const free = await checkAvailable(asked);
    if (free) {
      setStatus("Available");
      setAvailable(true);
    } else {
      setStatus("");
      setError("That handle is taken");
    }
  }

  function handleChange(next: string) {
    setHandle(next);
    // Whatever the last check decided was about a value that no longer exists.
    setStatus("");
    setError("");
    setAvailable(false);
  }

  return (
    <>
      <label htmlFor="handle">Handle</label>
      <input
        id="handle"
        value={handle}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={() => void check()}
        aria-invalid={error === "" ? "false" : "true"}
        aria-describedby={error === "" ? undefined : "handle-error"}
      />
      {error !== "" && <p id="handle-error">{error}</p>}

      <p role="status">{status}</p>

      <button type="button" disabled={!available}>
        Save
      </button>
    </>
  );
}
