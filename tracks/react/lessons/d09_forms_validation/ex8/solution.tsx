// d09_forms_validation / ex8 - the whole loop: attempt, fix, save, once.
// See tracks/react/lessons/d09_forms_validation/README.md, "Exercise 8".
import { useState, type FormEvent } from "react";

export function ProfileSetup({
  onSubmit,
}: {
  onSubmit: (profile: { teamName: string; website: string }) => Promise<void>;
}) {
  const [teamName, setTeamName] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("");

  const teamNameError =
    teamName.trim().length < 3 ? "Team name must be at least 3 characters" : "";
  const websiteError = website.startsWith("https://") ? "" : "Website must start with https://";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (teamNameError !== "" || websiteError !== "") {
      return;
    }
    await onSubmit({ teamName: teamName.trim(), website: website.trim() });
    setStatus("Saved");
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="team-name">Team name</label>
      <input
        id="team-name"
        value={teamName}
        onChange={(event) => setTeamName(event.target.value)}
        aria-invalid={teamNameError === "" ? "false" : "true"}
        aria-describedby={teamNameError === "" ? undefined : "team-name-error"}
      />
      {teamNameError !== "" && <p id="team-name-error">{teamNameError}</p>}

      <label htmlFor="website">Website</label>
      <input
        id="website"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        aria-invalid={websiteError === "" ? "false" : "true"}
        aria-describedby={websiteError === "" ? undefined : "website-error"}
      />
      {websiteError !== "" && <p id="website-error">{websiteError}</p>}

      <p role="status">{status}</p>
      <button type="submit">Create profile</button>
    </form>
  );
}
