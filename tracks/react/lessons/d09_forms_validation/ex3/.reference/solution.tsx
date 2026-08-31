// d09_forms_validation / ex3 - reference solution.
import { useState, type FormEvent } from "react";

export function PasswordPair({ onSubmit }: { onSubmit: (password: string) => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [attempted, setAttempted] = useState(false);

  const passwordError = password === "" ? "Password is required" : "";
  const confirmError =
    passwordError === "" && confirm !== password ? "Passwords do not match" : "";

  const showPassword = attempted && passwordError !== "";
  const showConfirm = attempted && confirmError !== "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (passwordError !== "" || confirmError !== "") {
      return;
    }
    onSubmit(password);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        aria-invalid={showPassword ? "true" : "false"}
        aria-describedby={showPassword ? "password-error" : undefined}
      />
      {showPassword && <p id="password-error">{passwordError}</p>}

      <label htmlFor="confirm">Confirm password</label>
      <input
        id="confirm"
        type="password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        aria-invalid={showConfirm ? "true" : "false"}
        aria-describedby={showConfirm ? "confirm-error" : undefined}
      />
      {showConfirm && <p id="confirm-error">{confirmError}</p>}

      <button type="submit">Set password</button>
    </form>
  );
}
