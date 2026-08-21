// 05_forms / ex4 - reference solution.
import { useState } from "react";

function validate(email: string, password: string): string[] {
  const problems: string[] = [];
  if (!email.includes("@")) {
    problems.push("Enter a valid email address");
  }
  if (password.length < 8) {
    problems.push("Password must be at least 8 characters");
  }
  return problems;
}

export function LoginForm({
  onSubmit,
}: {
  onSubmit: (credentials: { email: string; password: string }) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [problems, setProblems] = useState<string[]>([]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(email, password);
    setProblems(found);
    if (found.length === 0) {
      onSubmit({ email, password });
    }
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

      {problems.length > 0 && (
        <ul role="alert">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}

      <button type="submit">Sign in</button>
    </form>
  );
}
