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
import { compactTitle, SectionTitle } from "./shared";

export function JourneyView({
  index,
  pack,
  save,
  onTrack,
  onMission,
}: {
  index: ContentIndex;
  pack: TrackPack;
  save: SaveState;
  onTrack: (track: TrackMeta) => void;
  onMission: (lesson: Lesson, mission: Mission) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = pack.lessons.filter((lesson) =>
    `${lesson.title} ${lesson.summary}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <SectionTitle
        eyebrow="MISSION MAP"
        title={pack.name}
        action={
          <select
            value={pack.id}
            onChange={(event) => {
              const track = index.tracks.find(
                (item) => item.id === event.target.value,
              );
              if (track) onTrack(track);
            }}
          >
            {index.tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>
        }
      />
      <div className="journey-tools">
        <p>
          {pack.description}. Clear every core mission in a sector to unlock the
          next.
        </p>
        <input
          aria-label="Search missions"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sectors…"
        />
      </div>
      <div className="lesson-list">
        {filtered.map((lesson) => {
          const originalIndex = pack.lessons.indexOf(lesson);
          const unlocked = lessonUnlocked(pack.lessons, originalIndex, save);
          const core = lesson.exercises.filter(
            (mission) => mission.kind === "core",
          );
          const done = lesson.exercises.filter(
            (mission) => save.completed[missionKey(lesson, mission)],
          ).length;
          return (
            <article
              key={lesson.id}
              className={`lesson-card ${unlocked ? "" : "locked"}`}
            >
              <div className="lesson-node">
                {unlocked ? (
                  done === lesson.exercises.length ? (
                    <Check />
                  ) : (
                    String(originalIndex + 1).padStart(2, "0")
                  )
                ) : (
                  <LockKeyhole />
                )}
              </div>
              <div className="lesson-body">
                <div className="lesson-meta">
                  <span>
                    SECTOR {String(originalIndex + 1).padStart(2, "0")}
                  </span>
                  <b>
                    {done}/{lesson.exercises.length} cleared
                  </b>
                </div>
                <h3>{compactTitle(lesson.title)}</h3>
                <p>
                  {lesson.summary ||
                    "A focused sequence of active practice missions."}
                </p>
                <div className="mission-row">
                  {lesson.exercises.map((mission) => {
                    const isOpen =
                      unlocked && missionUnlocked(lesson, mission, save);
                    const complete = Boolean(
                      save.completed[missionKey(lesson, mission)],
                    );
                    return (
                      <button
                        key={mission.id}
                        disabled={!isOpen}
                        className={`${mission.kind} ${complete ? "complete" : ""}`}
                        onClick={() => onMission(lesson, mission)}
                        title={`${mission.id} · ${mission.xp} XP`}
                      >
                        {complete ? (
                          <Check size={14} />
                        ) : isOpen ? (
                          mission.kind === "challenge" ? (
                            <Swords size={14} />
                          ) : (
                            <Circle size={12} />
                          )
                        ) : (
                          <LockKeyhole size={13} />
                        )}{" "}
                        {mission.id}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="lesson-reward">
                <span>CORE</span>
                <strong>{core.reduce((sum, m) => sum + m.xp, 0)} XP</strong>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
