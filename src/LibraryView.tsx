import { useEffect, useState } from "react";
import { loadResources } from "./content";
import { canComplete, missionKey } from "./progression";
import { Markdown } from "./Markdown";
import type {
  Lesson,
  Mission,
  ResourceDoc,
  SaveState,
  TrackPack,
} from "./types";
export function LazyArchive({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <details onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>{title}</summary>
      {open && <Markdown>{value}</Markdown>}
    </details>
  );
}
export function LibraryView({
  pack,
  save,
  onMission,
}: {
  pack: TrackPack;
  save: SaveState;
  onMission: (lesson: Lesson, mission: Mission) => void;
}) {
  const [selected, setSelected] = useState(pack.lessons[0]),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1);
  const [resources, setResources] = useState<ResourceDoc[]>([]),
    [manual, setManual] = useState<ResourceDoc | null>(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    setSelected(pack.lessons[0]);
    setQuery("");
    setPage(1);
    setManual(null);
  }, [pack]);
  useEffect(() => {
    let active = true;
    setError("");
    loadResources()
      .then((r) => {
        if (active) setResources(r);
      })
      .catch((e) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, [retry]);
  const matches = pack.lessons.filter((l) =>
      `${l.title} ${l.summary}`.toLowerCase().includes(query.toLowerCase()),
    ),
    pages = Math.max(1, Math.ceil(matches.length / 12)),
    current = Math.min(page, pages);
  return (
    <section>
      <div className="section-title">
        <div>
          <span>KNOWLEDGE VAULT</span>
          <h1>{pack.name} archive</h1>
        </div>
      </div>
      <p>
        Read any lesson. Recording a new completion still requires earlier core
        missions. CLI commands and source paths in archived material belong to
        its original workspaces; this app does not execute them.
      </p>
      {error && (
        <p role="alert">
          {error}
          <button onClick={() => setRetry((n) => n + 1)}>Retry manuals</button>
        </p>
      )}
      <div className="manual-strip">
        {resources.map((r) => (
          <button
            key={r.id}
            onClick={() => setManual(manual?.id === r.id ? null : r)}
          >
            {r.title}
          </button>
        ))}
      </div>
      {manual ? (
        <section className="content-panel">
          <h2>{manual.title}</h2>
          <Markdown>{manual.markdown}</Markdown>
        </section>
      ) : (
        <div className="library-layout">
          <aside>
            <input
              aria-label="Filter archive"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Filter archive..."
            />
            <p>
              {matches.length} lessons · page {current} of {pages}
            </p>
            {matches.slice((current - 1) * 12, current * 12).map((l) => (
              <button
                className={l.id === selected.id ? "active" : ""}
                key={l.id}
                onClick={() => setSelected(l)}
              >
                {l.order + 1}. {l.title}
              </button>
            ))}
            {!matches.length && <p>No lessons match.</p>}
            <button
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              Previous lessons
            </button>
            <button
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              Next lessons
            </button>
          </aside>
          <section className="content-panel" key={selected.id}>
            <h2>{selected.title}</h2>
            <Markdown>{selected.explanation || selected.briefing}</Markdown>
            <div className="archive-missions">
              <h3>Practice missions</h3>
              {selected.exercises.map((m) => (
                <button
                  key={m.id}
                  disabled={!canComplete(save, missionKey(selected, m))}
                  onClick={() => onMission(selected, m)}
                >
                  <span>
                    {m.id}
                    {save.completed[missionKey(selected, m)]
                      ? " - self-reviewed"
                      : ""}
                  </span>
                  <b>{m.xp} XP</b>
                </button>
              ))}
            </div>
            <LazyArchive
              title="Read preserved source notes"
              value={selected.fullReading}
            />
          </section>
        </div>
      )}
    </section>
  );
}
