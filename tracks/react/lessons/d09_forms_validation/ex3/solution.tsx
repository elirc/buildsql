// d09_forms_validation / ex3 - a cross-field rule still has to blame one field.
// See tracks/react/lessons/d09_forms_validation/README.md, "Exercise 3".
import { useState, type FormEvent } from "react";

export function PasswordPair({ onSubmit }: { onSubmit: (password: string) => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [problems, setProblems] = useState<string[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: string[] = [];
    if (password === "") {
      found.push("Password is required");
    } else if (confirm !== password) {
      found.push("Passwords do not match");
    }
    setProblems(found);
    if (found.length === 0) {
      onSubmit(password);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <label htmlFor="confirm">Confirm password</label>
      <input
        id="confirm"
        type="password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
      />

      {problems.length > 0 && <p role="alert">{problems.join(". ")}</p>}
      <button type="submit">Set password</button>
    </form>
  );
}
