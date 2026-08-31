// d09_forms_validation / ex1 - reference solution.
import { useState, type FormEvent } from "react";

export function RequiredEmail({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (trimmed === "") {
      setError("Email is required");
      return;
    }
    setError("");
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-invalid={error === "" ? "false" : "true"}
        aria-describedby={error === "" ? undefined : "email-error"}
      />
      {error !== "" && <p id="email-error">{error}</p>}
      <button type="submit">Continue</button>
    </form>
  );
}
