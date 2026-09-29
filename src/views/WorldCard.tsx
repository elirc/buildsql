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
import { worldTone } from "./shared";

export function WorldCard({
  track,
  save,
  active,
  index,
  onClick,
}: {
  track: TrackMeta;
  save: SaveState;
  active: boolean;
  index: number;
  onClick: () => void;
}) {
  const done = Object.keys(save.completed).filter((id) =>
    id.startsWith(`${track.id}/`),
  ).length;
  const percent = Math.min(100, Math.round((done / track.exerciseCount) * 100));
  return (
    <button
      className={`world-card tone-${worldTone[track.id]} ${active ? "world-card--active" : ""}`}
      onClick={onClick}
    >
      <div className="world-index">0{index + 1}</div>
      <div className="world-icon">
        <Code2 />
      </div>
      <span>
        {track.lessonCount} sectors · {track.exerciseCount} missions
      </span>
      <h3>{track.name}</h3>
      <p>{track.description}</p>
      <div className="world-progress">
        <i style={{ width: `${percent}%` }} />
      </div>
      <small>{percent}% liberated</small>
    </button>
  );
}
