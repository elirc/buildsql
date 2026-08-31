// d09_forms_validation / ex2 - complain late, forgive early.
// See tracks/react/lessons/d09_forms_validation/README.md, "Exercise 2".
import { useState } from "react";

export function UsernameField() {
  const [username, setUsername] = useState("");
  const error = username.trim().length < 3 ? "Username must be at least 3 characters" : "";

  return (
    <>
      <label htmlFor="username">Username</label>
      <input
        id="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        aria-invalid={error === "" ? "false" : "true"}
        aria-describedby={error === "" ? undefined : "username-error"}
      />
      {error !== "" && <p id="username-error">{error}</p>}
    </>
  );
}
