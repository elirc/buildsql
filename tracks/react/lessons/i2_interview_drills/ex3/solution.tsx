// i2_interview_drills / ex3 - "a small form, validated, accessible."
// See tracks/react/lessons/i2_interview_drills/README.md, "Drill 3".
import { useState } from "react";

export function ProfileForm({
  onSubmit,
}: {
  onSubmit: (profile: { displayName: string; email: string }) => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ displayName, email });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="display-name">Display name</label>
      <input
        id="display-name"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
      />

      <label htmlFor="profile-email">Email</label>
      <input
        id="profile-email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <button type="submit">Save profile</button>
    </form>
  );
}
