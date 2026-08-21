// 05_forms / ex4 - validating on submit.
// See tracks/react/lessons/05_forms/README.md, "Exercise 4".
import { useState } from "react";

export function LoginForm({
  onSubmit,
}: {
  onSubmit: (credentials: { email: string; password: string }) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: validate before handing the credentials over.
    onSubmit({ email, password });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button type="submit">Sign in</button>
    </form>
  );
}
