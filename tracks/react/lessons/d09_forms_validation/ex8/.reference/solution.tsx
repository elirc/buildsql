// d09_forms_validation / ex8 - reference solution.
import { useState, type FormEvent } from "react";

export function ProfileSetup({
  onSubmit,
}: {
  onSubmit: (profile: { teamName: string; website: string }) => Promise<void>;
}) {
  const [teamName, setTeamName] = useState("");
  const [website, setWebsite] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const teamNameError =
    teamName.trim().length < 3 ? "Team name must be at least 3 characters" : "";
  const websiteError = website.trim().startsWith("https://")
    ? ""
    : "Website must start with https://";

  const showTeamName = attempted && teamNameError !== "";
  const showWebsite = attempted && websiteError !== "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (saving || teamNameError !== "" || websiteError !== "") {
      return;
    }

    setSaving(true);
    setStatus("");
    try {
      await onSubmit({ teamName: teamName.trim(), website: website.trim() });
      setStatus("Saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="team-name">Team name</label>
      <input
        id="team-name"
        value={teamName}
        onChange={(event) => setTeamName(event.target.value)}
        aria-invalid={showTeamName ? "true" : "false"}
        aria-describedby={showTeamName ? "team-name-error" : undefined}
      />
      {showTeamName && <p id="team-name-error">{teamNameError}</p>}

      <label htmlFor="website">Website</label>
      <input
        id="website"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        aria-invalid={showWebsite ? "true" : "false"}
        aria-describedby={showWebsite ? "website-error" : undefined}
      />
      {showWebsite && <p id="website-error">{websiteError}</p>}

      <p role="status">{status}</p>

      <button type="submit" disabled={saving}>
        {saving ? "Saving" : "Create profile"}
      </button>
    </form>
  );
}
