// d09_forms_validation / ex2 - reference solution.
import { useState } from "react";

export function UsernameField() {
  const [username, setUsername] = useState("");
  const [touched, setTouched] = useState(false);

  const error = username.trim().length < 3 ? "Username must be at least 3 characters" : "";
  const shown = touched && error !== "";

  return (
    <>
      <label htmlFor="username">Username</label>
      <input
        id="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        onBlur={() => setTouched(true)}
        aria-invalid={shown ? "true" : "false"}
        aria-describedby={shown ? "username-error" : undefined}
      />
      {shown && <p id="username-error">{error}</p>}
    </>
  );
}
