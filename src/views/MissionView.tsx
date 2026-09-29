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
import { loadIndex, loadResources, loadTrack } from "../content";
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
} from "../game";
import { catalog } from "../contracts";
import { useWorkspace, downloadText } from "../useWorkspace";
import { WorkspaceSettings as SettingsView } from "../WorkspaceSettings";
import { LibraryView, LazyArchive } from "../LibraryView";
import { PracticeView } from "../PracticeView";
import { Markdown } from "../Markdown";
import type {
  ContentIndex,
  Lesson,
  Mission,
  ResourceDoc,
  SaveState,
  TrackMeta,
  TrackPack,
  View,
} from "../types";
import { compactTitle, missionTitle, briefingCore } from "./shared";

export function MissionView({
  lesson,
  mission,
  save,
  onBack,
  onWork,
  onComplete,
}: {
  lesson: Lesson;
  mission: Mission;
  save: SaveState;
  onBack: () => void;
  onWork: (value: string) => void;
  onComplete: (outcome: "pass" | "retry") => void;
}) {
  const id = missionKey(lesson, mission);
  const [tab, setTab] = useState<"brief" | "mission" | "debrief">("mission");
  const [hints, setHints] = useState(0);
  const [ran, setRan] = useState(false);
  const completed = Boolean(save.completed[id]);
  const work = save.work[id] ?? "";
  const hintParts = mission.importantHints
    .split(/(?=^##\s+Hint)/m)
    .filter((part) => part.trim());
  const references = Object.entries(mission.references);

  return (
    <div className="mission-view">
      <div className="mission-header">
        <button className="back" onClick={onBack}>
          <ArrowLeft /> Journey map
        </button>
        <div className={`kind kind-${mission.kind}`}>
          {mission.kind === "challenge" ? <Swords /> : <Target />}
          {mission.kind} mission
        </div>
        <div className="mission-xp">
          <Zap /> {mission.xp} XP
        </div>
      </div>
      <h1>{missionTitle(mission)}</h1>
      <p className="mission-context">
        {compactTitle(lesson.title)} · {mission.id}
      </p>
      <p className="workspace-message">
        This is written practice and self-review. Code is not executed here.
        Archived CLI commands and solution paths refer to source workspaces that
        are not included in this browser app. Use CRUD practice to record
        runnable work and test evidence.
      </p>
      <div className="mission-tabs">
        <button
          className={tab === "brief" ? "active" : ""}
          onClick={() => setTab("brief")}
        >
          <BookOpen /> Intel
        </button>
        <button
          className={tab === "mission" ? "active" : ""}
          onClick={() => setTab("mission")}
        >
          <Code2 /> Workspace
        </button>
        <button
          className={tab === "debrief" ? "active" : ""}
          onClick={() => setTab("debrief")}
        >
          <BrainCircuit /> Debrief
        </button>
      </div>
      {tab === "brief" && (
        <div className="content-panel">
          <div className="panel-label">MISSION INTEL // IMPORTANT CONCEPTS</div>
          <Markdown>{briefingCore(lesson)}</Markdown>
          <LazyArchive
            title="Open the complete archived lesson"
            value={lesson.fullReadme}
          />
        </div>
      )}
      {tab === "mission" && (
        <div className="workspace-grid">
          <section className="content-panel prompt-panel">
            <div className="panel-label">OBJECTIVE</div>
            <Markdown>{mission.prompt || lesson.summary}</Markdown>
            <div className="hint-stack">
              <div className="hint-title">
                <span>Encrypted field notes</span>
                <b>
                  {hints}/{hintParts.length} revealed
                </b>
              </div>
              {hintParts.slice(0, hints).map((hint, i) => (
                <div className="hint" key={i}>
                  <Markdown compact>{hint}</Markdown>
                </div>
              ))}
              {hints < hintParts.length && (
                <button
                  className="secondary"
                  onClick={() => setHints((value) => value + 1)}
                >
                  <ShieldCheck /> Reveal hint {hints + 1}
                </button>
              )}
            </div>
          </section>
          <section className="editor-panel">
            <div className="editor-bar">
              <span>
                <i />
                <i />
                <i />
              </span>
              <b>mission-workspace.txt</b>
              <em>SAVE EXPLICITLY</em>
            </div>
            <textarea
              aria-label="Mission workspace"
              maxLength={100000}
              value={work}
              onChange={(event) => {
                onWork(event.target.value);
                setRan(false);
              }}
              spellCheck={false}
              placeholder="Write your solution, reasoning, expected result and testing evidence..."
            />
            <div className="editor-actions">
              <span>
                {work.length} chars · attempt {(save.attempts[id] ?? 0) + 1}
              </span>
              <button
                className="primary"
                disabled={work.trim().length < 20}
                onClick={() => setRan(true)}
              >
                <Zap /> Compare with reference
              </button>
            </div>
            {ran && (
              <div className="checkpoint">
                <strong>
                  <ShieldCheck /> SELF-REVIEW
                </strong>
                <p>
                  Compare the behavior and explain why it works. This does not
                  run a compiler or test suite.{" "}
                  {completed
                    ? "Repeating a mission awards no additional XP."
                    : "The configured reward is awarded once."}{" "}
                  Save the workspace to persist the result.
                </p>
                {references.length ? (
                  references.map(([name, value]) => (
                    <details key={name}>
                      <summary>Read {name}</summary>
                      <pre>
                        <code>{value}</code>
                      </pre>
                    </details>
                  ))
                ) : (
                  <p className="muted">
                    Validate against the mission's observable outcome.
                  </p>
                )}
                <div className="verdicts">
                  <button
                    onClick={() => {
                      onComplete("retry");
                      setRan(false);
                      setTab("debrief");
                    }}
                  >
                    Record needs practice
                  </button>
                  <button
                    className="success"
                    onClick={() => {
                      onComplete("pass");
                      setRan(false);
                    }}
                  >
                    {completed
                      ? "Record successful recall"
                      : "Record self-reviewed completion"}{" "}
                    <Check />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
      {tab === "debrief" && (
        <div className="content-panel">
          <div className="panel-label">
            DEBRIEF // THE REASONING THAT MATTERS
          </div>
          <Markdown>{lesson.explanation}</Markdown>
          <LazyArchive
            title="Open all notes and the retrieval bank"
            value={lesson.fullReading}
          />
        </div>
      )}
    </div>
  );
}
