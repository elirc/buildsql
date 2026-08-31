// d09_forms_validation / ex1 - the error belongs to the field, not to the page.
// See tracks/react/lessons/d09_forms_validation/README.md, "Exercise 1".
import { useState, type FormEvent } from "react";

export function RequiredEmail({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email === "") {
      setError("Email is required");
      return;
    }
    setError("");
    onSubmit(email);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      {error !== "" && <p>{error}</p>}
      <button type="submit">Continue</button>
    </form>
  );
}
