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
import { compactTitle, missionTitle, SectionTitle } from "./shared";
import { WorldCard } from "./WorldCard";

export function HomeView({
  index,
  pack,
  save,
  onTrack,
  onContinue,
}: {
  index: ContentIndex;
  pack: TrackPack;
  save: SaveState;
  onTrack: (track: TrackMeta) => void;
  onContinue: () => void;
}) {
  const complete = Object.keys(save.completed).length;
  const nextLesson =
    pack.lessons.find(
      (item, i) =>
        lessonUnlocked(pack.lessons, i, save) &&
        item.exercises.some(
          (mission) => !save.completed[missionKey(item, mission)],
        ),
    ) ?? pack.lessons[0];
  const nextMission =
    nextLesson.exercises.find(
      (mission) =>
        missionUnlocked(nextLesson, mission, save) &&
        !save.completed[missionKey(nextLesson, mission)],
    ) ?? nextLesson.exercises[0];
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">// ACTIVE CAMPAIGN</span>
          <h1>
            Build your edge.
            <br />
            <em>One mission at a time.</em>
          </h1>
          <p>
            Reading is intel. Building is how you rank up. Complete missions,
            defeat challenge gates, and revisit skills before they decay.
          </p>
          <button className="primary" onClick={onContinue}>
            <Gamepad2 size={19} /> Continue mission <ChevronRight size={18} />
          </button>
        </div>
        <div className="hero-mission">
          <div className="mission-scan" />
          <span>NEXT MISSION</span>
          <b>{pack.name}</b>
          <h3>{compactTitle(nextLesson.title)}</h3>
          <p>{missionTitle(nextMission)}</p>
          <div className="reward">
            <Zap size={16} /> +{nextMission.xp} XP <i /> {nextLesson.order + 1}{" "}
            / {pack.lessons.length}
          </div>
        </div>
      </section>
      <section className="stat-grid">
        <article>
          <Target />
          <div>
            <strong>{complete}</strong>
            <span>Missions cleared</span>
          </div>
        </article>
        <article>
          <Trophy />
          <div>
            <strong>
              {
                catalog.filter(
                  (m) => m.kind === "challenge" && save.completed[m.id],
                ).length
              }
            </strong>
            <span>Challenges self-reviewed</span>
          </div>
        </article>
        <article>
          <BrainCircuit />
          <div>
            <strong>{dueReviewIds(save).length}</strong>
            <span>Reviews due</span>
          </div>
        </article>
        <article>
          <Archive />
          <div>
            <strong>{index.exerciseCount.toLocaleString()}</strong>
            <span>Total missions</span>
          </div>
        </article>
      </section>
      <SectionTitle
        eyebrow="CHOOSE YOUR FRONTIER"
        title="Six worlds. One skill tree."
      />
      <div className="world-grid">
        {index.tracks.map((track, i) => (
          <WorldCard
            key={track.id}
            track={track}
            save={save}
            active={track.id === pack.id}
            index={i}
            onClick={() => onTrack(track)}
          />
        ))}
      </div>
    </>
  );
}
