import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  Circle,
  Code2,
  Download,
  Flame,
  Gamepad2,
  Home,
  Import,
  Library,
  LockKeyhole,
  Map,
  Menu,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { loadIndex, loadResources, loadTrack } from "./content";
import {
  completeMission,
  dueReviewIds,
  initialSave,
  lessonUnlocked,
  levelFor,
  missionKey,
  missionUnlocked,
  progressToNextLevel,
  xpFor,
  canComplete,
} from "./game";
import { catalog } from "./contracts";
import { useWorkspace, downloadText } from "./useWorkspace";
import { WorkspaceSettings as SettingsView } from "./WorkspaceSettings";
import { LibraryView, LazyArchive } from "./LibraryView";
import { PracticeView } from "./PracticeView";
import { Markdown } from "./Markdown";
import type {
  ContentIndex,
  Lesson,
  Mission,
  ResourceDoc,
  SaveState,
  TrackMeta,
  TrackPack,
  View,
} from "./types";
import { compactTitle, Loading } from "./views/shared";
import { HomeView } from "./views/HomeView";
import { JourneyView } from "./views/JourneyView";
import { MissionView } from "./views/MissionView";
import { ReviewsView } from "./views/ReviewsView";


function App() {
  const [index, setIndex] = useState<ContentIndex | null>(null);
  const [pack, setPack] = useState<TrackPack | null>(null);
  const workspace = useWorkspace();
  const save = workspace.draft?.save ?? initialSave;
  const [formPending, setFormPending] = useState(false);
  const [contentError, setContentError] = useState("");
  const [retry, setRetry] = useState(0);
  const [view, setView] = useState<View>("home");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    let active = true;
    loadIndex()
      .then((value) => {
        if (active) setIndex(value);
      })
      .catch((e) => {
        if (active) setContentError(String(e));
      });
    return () => {
      active = false;
    };
  }, [retry]);

  useEffect(() => {
    setLoading(true);
    let active = true;
    setContentError("");
    loadTrack(save.selectedTrack)
      .then((value) => {
        if (active) setPack(value);
      })
      .catch((e) => {
        if (active) setContentError(String(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [save.selectedTrack, retry]);

  const xp = xpFor(save);
  const level = progressToNextLevel(xp);
  const due = dueReviewIds(save);

  function mutate(change: (current: SaveState) => SaveState) {
    workspace.edit((current) => ({ ...current, save: change(current.save) }));
  }
  function navigate(next: View) {
    if (formPending) {
      workspace.setError(
        "Apply or cancel the practice form before leaving. Its input is retained.",
      );
      return;
    }
    setView(next);
    setNavOpen(false);
  }

  function selectTrack(track: TrackMeta | { id: string }) {
    if (formPending) {
      workspace.setError(
        "Apply or cancel the practice form before switching tracks.",
      );
      return;
    }
    mutate((current) => ({ ...current, selectedTrack: track.id }));
    setLesson(null);
    setMission(null);
    setView("journey");
  }

  function openMission(nextLesson: Lesson, nextMission: Mission) {
    if (!canComplete(save, missionKey(nextLesson, nextMission))) {
      workspace.setError(
        "Complete the prerequisite core missions first. Reading the archive remains available.",
      );
      return;
    }
    setLesson(nextLesson);
    setMission(nextMission);
    setView("mission");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function continueJourney() {
    if (!pack) return;
    for (let i = 0; i < pack.lessons.length; i += 1) {
      const candidate = pack.lessons[i];
      if (!lessonUnlocked(pack.lessons, i, save)) break;
      const next = candidate.exercises.find(
        (item) =>
          missionUnlocked(candidate, item, save) &&
          !save.completed[missionKey(candidate, item)],
      );
      if (next) return openMission(candidate, next);
    }
    setView("journey");
  }

  const nav = [
    { id: "home" as View, label: "Command", icon: Home },
    { id: "journey" as View, label: "Journey", icon: Map },
    {
      id: "reviews" as View,
      label: "Review queue",
      icon: BrainCircuit,
      badge: due.length,
    },
    { id: "library" as View, label: "Knowledge vault", icon: Library },
    { id: "practice" as View, label: "CRUD practice", icon: Code2 },
    { id: "settings" as View, label: "Save data", icon: Settings },
  ];

  return (
    <div className="app-shell">
      <button
        className="mobile-menu"
        onClick={() => setNavOpen(true)}
        aria-label="Open menu"
      >
        <Menu />
      </button>
      <aside className={`sidebar ${navOpen ? "sidebar--open" : ""}`}>
        <button
          className="sidebar-close"
          onClick={() => setNavOpen(false)}
          aria-label="Close menu"
        >
          <X />
        </button>
        <div className="brand">
          <div className="brand-mark">
            <Code2 size={21} />
          </div>
          <div>
            <strong>IPSKILL</strong>
            <span>LEVEL UP BY BUILDING</span>
          </div>
        </div>
        <div className="operative-card">
          <div className="avatar">
            {save.playerName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span>OPERATIVE</span>
            <strong>{save.playerName}</strong>
            <small>Level {level.level} builder</small>
          </div>
        </div>
        <nav>
          {nav.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => navigate(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {Boolean(item.badge) && <b>{item.badge}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-level">
          <div>
            <span>LVL {level.level}</span>
            <span>{xp.toLocaleString()} XP</span>
          </div>
          <div className="meter">
            <i style={{ width: `${level.percent}%` }} />
          </div>
          <small>
            {level.needed - level.current} XP to level {level.level + 1}
          </small>
        </div>
        <div className="streak">
          <Flame size={18} />
          <strong>{save.streak} day streak</strong>
          <span>Keep the signal alive</span>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div className="crumb">
            <span>IPSKILL</span>
            <ChevronRight size={14} />
            <strong>
              {view === "mission"
                ? compactTitle(mission?.title ?? "Mission")
                : nav.find((item) => item.id === view)?.label}
            </strong>
          </div>
          <div className="top-stats">
            <span>
              <Zap size={15} /> {xp.toLocaleString()} XP
            </span>
            <span>
              <Flame size={15} /> {save.streak}
            </span>
            <span className="online">
              {workspace.dirty ? "UNSAVED DRAFT" : "LOCAL WORKSPACE"}
            </span>
          </div>
        </header>

        <div className="page">
          {workspace.error && (
            <div className="workspace-message error" role="alert">
              {workspace.error}
            </div>
          )}
          {workspace.notice && (
            <div className="workspace-message" role="status">
              {workspace.notice}
            </div>
          )}
          {workspace.draft && (
            <div className="workspace-toolbar">
              <span>
                {workspace.dirty ? "Unsaved changes" : "Accepted locally"} ·
                revision {workspace.draft.revision}
              </span>
              <button
                className="primary"
                disabled={!workspace.dirty || workspace.busy || formPending}
                onClick={workspace.save}
              >
                Save workspace
              </button>
              <button onClick={workspace.exportDraft}>
                Export workspace draft
              </button>
              <button
                disabled={workspace.busy || formPending}
                onClick={workspace.reload}
              >
                Load current data
              </button>
            </div>
          )}
          {workspace.loading ? (
            <Loading />
          ) : !workspace.draft ? (
            <section className="content-panel">
              <h1>Start your local learning workspace</h1>
              <p>
                Progress stays in this browser profile. Save changes explicitly
                and export regular backups. No cloud account is created.
              </p>
              {workspace.legacy ? (
                <>
                  <p>
                    A previous save exists. Import checks its known missions,
                    rewards and dates, preserves the original raw text, and
                    creates a recovery snapshot. Invalid data is never silently
                    reset.
                  </p>
                  <button
                    onClick={() =>
                      downloadText(
                        "ipskill-legacy-original.json",
                        workspace.legacy!,
                      )
                    }
                  >
                    Export original save
                  </button>
                  <button
                    className="primary"
                    disabled={workspace.busy}
                    onClick={() => workspace.initialize(true)}
                  >
                    Review and migrate existing save
                  </button>
                </>
              ) : (
                <button
                  className="primary"
                  disabled={workspace.busy || Boolean(workspace.error)}
                  onClick={() => workspace.initialize(false)}
                >
                  Create empty local workspace
                </button>
              )}
              <button disabled={workspace.busy} onClick={workspace.exportRaw}>
                Export accepted raw data
              </button>
            </section>
          ) : contentError ? (
            <section className="content-panel" role="alert">
              <h2>Content could not be loaded</h2>
              <p>{contentError}</p>
              <button onClick={() => setRetry((n) => n + 1)}>
                Retry content loading
              </button>
            </section>
          ) : loading || !index || !pack ? (
            <Loading />
          ) : (
            <fieldset className="workspace-content" disabled={workspace.busy}>
              {view === "home" && (
                <HomeView
                  index={index}
                  pack={pack}
                  save={save}
                  onTrack={selectTrack}
                  onContinue={continueJourney}
                />
              )}
              {view === "journey" && (
                <JourneyView
                  index={index}
                  pack={pack}
                  save={save}
                  onTrack={selectTrack}
                  onMission={openMission}
                />
              )}
              {view === "mission" && lesson && mission && (
                <MissionView
                  key={missionKey(lesson, mission)}
                  lesson={lesson}
                  mission={mission}
                  save={save}
                  onBack={() => setView("journey")}
                  onWork={(value) =>
                    mutate((current) => ({
                      ...current,
                      work: {
                        ...current.work,
                        [missionKey(lesson, mission)]: value,
                      },
                    }))
                  }
                  onComplete={(outcome) =>
                    mutate((current) =>
                      completeMission(
                        current,
                        missionKey(lesson, mission),
                        new Date(),
                        outcome,
                      ),
                    )
                  }
                />
              )}
              {view === "reviews" && (
                <ReviewsView
                  pack={pack}
                  save={save}
                  onMission={openMission}
                  onTrack={selectTrack}
                  index={index}
                />
              )}
              {view === "library" && (
                <LibraryView pack={pack} save={save} onMission={openMission} />
              )}
              {view === "settings" && <SettingsView workspace={workspace} />}
              {view === "practice" && (
                <PracticeView
                  workspace={workspace.draft}
                  busy={workspace.busy}
                  onChange={workspace.edit}
                  onPending={setFormPending}
                />
              )}
            </fieldset>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
