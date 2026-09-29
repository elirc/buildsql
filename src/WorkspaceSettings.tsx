import { useState } from "react";
import { MAX_BYTES } from "./contracts";
import { importWorkspace } from "./storage";
import { downloadText, useWorkspace } from "./useWorkspace";

export function WorkspaceSettings({
  workspace,
}: {
  workspace: ReturnType<typeof useWorkspace>;
}) {
  const [candidate, setCandidate] = useState<{
    raw: string;
    name: string;
    missions: number;
    projects: number;
  } | null>(null);
  async function inspect(file?: File) {
    setCandidate(null);
    if (!file) return;
    try {
      if (file.size > MAX_BYTES) throw Error("Import exceeds 8 MiB.");
      const raw = await file.text(),
        value = importWorkspace(raw);
      setCandidate({
        raw,
        name: file.name,
        missions: Object.keys(value.save.completed).length,
        projects: value.projects.length,
      });
    } catch (e) {
      workspace.setError(e instanceof Error ? e.message : "Import is invalid.");
    }
  }
  return (
    <section>
      <div className="section-title">
        <div>
          <span>LOCAL DATA AND RECOVERY</span>
          <h1>Save data</h1>
        </div>
      </div>
      <div className="settings-grid">
        <section className="setting-card">
          <h2>Identity and local save</h2>
          <p>
            Changes remain a draft until Save workspace completes. Another tab
            cannot overwrite an accepted revision without a conflict. UTC
            calendar days determine streaks; review intervals are elapsed
            24-hour days.
          </p>
          <label>
            Operative name
            <input
              aria-label="Operative name"
              maxLength={24}
              value={workspace.draft!.save.playerName}
              onChange={(e) =>
                workspace.edit((w) => ({
                  ...w,
                  save: { ...w.save, playerName: e.target.value },
                }))
              }
            />
          </label>
          <p>
            Last activity: {workspace.draft!.save.lastActive ?? "Not started"}
          </p>
          <p>
            No server or account is connected. Browser data can be cleared or
            evicted; keep independent exports.
          </p>
        </section>
        <section className="setting-card">
          <h2>Review an import</h2>
          <p>
            Export your current workspace first. A valid import is previewed
            here; applying it creates a new workspace identity and preserves the
            earlier accepted aggregate as a recovery snapshot. Unsaved drafts
            must be resolved first.
          </p>
          <button onClick={workspace.exportDraft}>Export workspace</button>
          <button onClick={workspace.exportRaw}>
            Export accepted raw data
          </button>
          <label>
            Choose workspace import
            <input
              aria-label="Choose workspace import"
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                void inspect(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {candidate && (
            <div className="workspace-message">
              <strong>{candidate.name}</strong>
              <p>
                {candidate.missions} known completed missions;{" "}
                {candidate.projects} practice projects. Replaces the entire
                workspace, including current notes and schedules.
              </p>
              <button
                className="primary"
                disabled={workspace.dirty || workspace.busy}
                onClick={async () => {
                  if (
                    window.confirm(
                      "Replace the accepted workspace with this reviewed import? The previous accepted data will be retained as a snapshot.",
                    )
                  )
                    await workspace.replace(candidate.raw);
                }}
              >
                Apply reviewed import
              </button>
              <button onClick={() => setCandidate(null)}>Cancel import</button>
            </div>
          )}
        </section>
      </div>
      <section className="content-panel">
        <h2>Recovery snapshots</h2>
        <p>
          Up to ten snapshots are retained. Replacement refuses a full snapshot
          store rather than deleting history. Download a snapshot and use the
          same import preview to restore it. Restoring also preserves the
          current accepted workspace.
        </p>
        {workspace.backups.length === 0 ? (
          <p>No replacements or migrations have created a snapshot.</p>
        ) : (
          workspace.backups.map((b) => (
            <div className="workspace-toolbar" key={b.id}>
              <span>
                {b.created} · {b.reason}
              </span>
              <button
                onClick={() =>
                  downloadText(`ipskill-recovery-${b.id}.json`, b.raw)
                }
              >
                Download recovery snapshot
              </button>
            </div>
          ))
        )}
      </section>
    </section>
  );
}
