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

export function ReviewsView({
  pack,
  save,
  onMission,
  onTrack,
  index,
}: {
  pack: TrackPack;
  save: SaveState;
  onMission: (lesson: Lesson, mission: Mission) => void;
  onTrack: (track: TrackMeta) => void;
  index: ContentIndex;
}) {
  const due = dueReviewIds(save);
  const local = pack.lessons
    .flatMap((lesson) =>
      lesson.exercises.map((mission) => ({
        lesson,
        mission,
        id: missionKey(lesson, mission),
      })),
    )
    .filter((item) => due.includes(item.id));
  const remoteTracks = [
    ...new Set(
      due.map((id) => id.split("/")[0]).filter((id) => id !== pack.id),
    ),
  ];
  return (
    <>
      <SectionTitle eyebrow="MEMORY MAINTENANCE" title="Review queue" />
      <div className="review-hero">
        <BrainCircuit />
        <div>
          <strong>{due.length}</strong>
          <span>signals need reinforcement</span>
        </div>
        <p>
          Reviews arrive at growing intervals. A miss is not failure—it is the
          scheduler finding the exact edge worth rebuilding.
        </p>
      </div>
      {remoteTracks.map((id) => {
        const track = index.tracks.find((item) => item.id === id);
        return (
          track && (
            <button
              className="remote-review"
              key={id}
              onClick={() => onTrack(track)}
            >
              Load {track.name} reviews <ChevronRight />
            </button>
          )
        );
      })}
      <div className="review-list">
        {local.length ? (
          local.map(({ lesson, mission, id }) => (
            <button key={id} onClick={() => onMission(lesson, mission)}>
              <div>
                <span>
                  STAGE {(save.reviews[id]?.stage ?? 0) + 1} · DUE NOW
                </span>
                <strong>
                  {compactTitle(lesson.title)} / {mission.id}
                </strong>
              </div>
              <b>
                RECALL <ChevronRight />
              </b>
            </button>
          ))
        ) : (
          <div className="empty">
            <ShieldCheck />
            <h3>Memory systems nominal</h3>
            <p>
              No reviews are due in this world. Continue the journey to seed new
              review missions.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
