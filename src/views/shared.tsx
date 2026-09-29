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

export const worldTone: Record<string, string> = {
  sql: "cyan",
  typescript: "violet",
  node: "lime",
  react: "blue",
  csharp: "amber",
  dotnet: "rose",
};

export function compactTitle(title: string) {
  return title
    .replace(/^\d+\s*[—-]\s*/, "")
    .replace(/^[a-z]\d+\s*[—-]\s*/i, "");
}

export function missionTitle(mission: Mission) {
  const heading = mission.prompt.match(/^##\s+(.+)$/m)?.[1];
  return (
    compactTitle(heading ?? mission.title).replace(
      /^(exercise\s+\d+|ex\d+)\s*[—-]?\s*/i,
      "",
    ) || mission.id
  );
}

export function briefingCore(lesson: Lesson) {
  return lesson.briefing.split(
    /\n##\s+(?:Exercise\s+1\b|ex1\b|Challenge\b)/i,
  )[0];
}

export function Loading() {
  return (
    <div className="loading">
      <div className="loader">
        <i />
        <i />
        <i />
      </div>
      <strong>LOADING WORLD DATA</strong>
      <span>Decrypting mission archive…</span>
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
