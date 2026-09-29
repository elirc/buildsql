import { useEffect, useState } from "react";
import { statuses, type PracticeProject, type Workspace } from "./contracts";
import { putProject, deleteProject } from "./progression";
import { downloadText } from "./useWorkspace";

type Form = Omit<PracticeProject, "created" | "updated" | "version"> & {
  version?: number;
};
const empty = (): Form => ({
  id: crypto.randomUUID(),
  title: "",
  goal: "",
  evidence: "",
  status: "planned",
});
export function PracticeView({
  workspace,
  busy,
  onChange,
  onPending,
}: {
  workspace: Workspace;
  busy: boolean;
  onChange: (fn: (w: Workspace) => Workspace) => void;
  onPending: (pending: boolean) => void;
}) {
  const [form, setForm] = useState<Form | null>(null),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("all"),
    [page, setPage] = useState(1);
  useEffect(() => {
    onPending(form !== null);
    const prevent = (e: BeforeUnloadEvent) => {
      if (form) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", prevent);
    return () => {
      onPending(false);
      window.removeEventListener("beforeunload", prevent);
    };
  }, [form, onPending]);
  const filtered = workspace.projects
    .filter(
      (p) =>
        (status === "all" || p.status === status) &&
        `${p.title} ${p.goal}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort(
      (a, b) => b.updated.localeCompare(a.updated) || a.id.localeCompare(b.id),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / 10)),
    current = Math.min(page, pages);
  function apply(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    try {
      const { version, ...input } = form;
      const next = putProject(workspace, input, version);
      onChange(() => next);
      setForm(null);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Project change rejected.");
    }
  }
  function remove(project: PracticeProject) {
    if (
      !window.confirm(
        `Delete practice project "${project.title}" from the workspace draft? Save the workspace to persist deletion.`,
      )
    )
      return;
    onChange((w) => deleteProject(w, project.id, project.version));
  }
  return (
    <section className="practice-view">
      <div className="section-title">
        <div>
          <span>BUILD AND EXPLAIN</span>
          <h1>CRUD practice projects</h1>
        </div>
        <button
          className="primary"
          disabled={Boolean(form) || busy}
          onClick={() => setForm(empty())}
        >
          New practice project
        </button>
      </div>
      <p>
        Track a small app from contract to tested behavior. Start with a contact
        list, then add validation, search, versioned edits and failure recovery.
        Evidence is your written record; status changes do not execute tests or
        certify correctness.
      </p>
      <p>
        Suggested sequence: contact CRUD, filtered issue tracker, inventory with
        history, owned records with permissions, and a booking workflow with
        conflicting updates. Use the source and exercises in{" "}
        <code>astraupskill</code> to implement and review each step.
      </p>
      {error && (
        <p role="alert" className="workspace-message error">
          {error}
        </p>
      )}
      {form && (
        <form className="content-panel practice-form" onSubmit={apply}>
          <h2>
            {form.version ? "Edit practice project" : "New practice project"}
          </h2>
          <fieldset disabled={busy}>
            <label>
              Project title
              <input
                aria-label="Project title"
                required
                maxLength={80}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label>
              Observable goal
              <textarea
                aria-label="Observable goal"
                required
                maxLength={2000}
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              />
            </label>
            <label>
              Project status
              <select
                aria-label="Project status"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as Form["status"] })
                }
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Implementation and test evidence
              <textarea
                aria-label="Implementation and test evidence"
                maxLength={10000}
                value={form.evidence}
                onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                placeholder="Changed files, command run, observed result, rejected path, remaining limitation..."
              />
            </label>
            <p>
              Review needs at least 40 characters of evidence; completion needs
              80. A meaningful explanation matters more than meeting a length
              threshold.
            </p>
            <div className="workspace-toolbar">
              <button className="primary" type="submit">
                Apply project to workspace draft
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadText(
                    "ipskill-practice-form.json",
                    JSON.stringify(form, null, 2),
                  )
                }
              >
                Export practice form
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Discard this practice form?")) {
                    setForm(null);
                    setError("");
                  }
                }}
              >
                Cancel practice form
              </button>
            </div>
          </fieldset>
        </form>
      )}
      <div className="journey-tools">
        <input
          aria-label="Search practice projects"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search projects..."
        />
        <select
          aria-label="Filter project status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <p>
        {filtered.length} projects · page {current} of {pages}
      </p>
      <div className="practice-list">
        {filtered.slice((current - 1) * 10, current * 10).map((project) => (
          <article key={project.id} className="content-panel">
            <span>
              {project.status} · version {project.version}
            </span>
            <h2>{project.title}</h2>
            <p>{project.goal}</p>
            <pre className="evidence">
              {project.evidence || "No evidence recorded yet."}
            </pre>
            <div className="workspace-toolbar">
              <button
                disabled={Boolean(form) || busy}
                onClick={() => setForm({ ...project })}
              >
                Edit {project.title}
              </button>
              <button
                disabled={Boolean(form) || busy}
                onClick={() => remove(project)}
              >
                Delete {project.title}
              </button>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <p className="empty">
          No practice projects match. Create a project with an observable goal.
        </p>
      )}
      <div className="workspace-toolbar">
        <button disabled={current === 1} onClick={() => setPage(current - 1)}>
          Previous projects
        </button>
        <button
          disabled={current === pages}
          onClick={() => setPage(current + 1)}
        >
          Next projects
        </button>
      </div>
    </section>
  );
}
