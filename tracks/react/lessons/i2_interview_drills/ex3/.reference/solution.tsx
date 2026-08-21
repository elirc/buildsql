// i2_interview_drills / ex3 - reference solution.
import { useState } from "react";

type Errors = { displayName?: string; email?: string };

function validate(displayName: string, email: string): Errors {
  const errors: Errors = {};
  if (displayName.trim().length < 2) {
    errors.displayName = "Display name must be at least 2 characters";
  }
  if (!email.includes("@")) {
    errors.email = "Enter a valid email address";
  }
  return errors;
}

export function ProfileForm({
  onSubmit,
}: {
  onSubmit: (profile: { displayName: string; email: string }) => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [attempted, setAttempted] = useState(false);

  // Recomputed every render, so a field's error clears the moment it is fixed.
  const errors = validate(displayName, email);
  const shown: Errors = attempted ? errors : {};

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(errors).length === 0) {
      onSubmit({ displayName, email });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="display-name">Display name</label>
      <input
        id="display-name"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        aria-invalid={shown.displayName !== undefined}
        aria-describedby={shown.displayName ? "display-name-error" : undefined}
      />
      {shown.displayName && <span id="display-name-error">{shown.displayName}</span>}

      <label htmlFor="profile-email">Email</label>
      <input
        id="profile-email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-invalid={shown.email !== undefined}
        aria-describedby={shown.email ? "profile-email-error" : undefined}
      />
      {shown.email && <span id="profile-email-error">{shown.email}</span>}

      <button type="submit">Save profile</button>
    </form>
  );
}
