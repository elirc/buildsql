export type MissionKind = "core" | "challenge" | "review";

export interface Mission {
  id: string;
  title: string;
  kind: MissionKind;
  prompt: string;
  hints: string;
  importantHints: string;
  references: Record<string, string>;
  xp: number;
}

export interface Lesson {
  id: string;
  slug: string;
  order: number;
  title: string;
  summary: string;
  briefing: string;
  explanation: string;
  fullReadme: string;
  fullReading: string;
  exercises: Mission[];
}

export interface TrackMeta {
  id: string;
  name: string;
  description: string;
  lessonCount: number;
  exerciseCount: number;
  coreCount: number;
  pack: string;
}

export interface ContentIndex {
  version: number;
  lessonCount: number;
  exerciseCount: number;
  tracks: TrackMeta[];
}

export interface TrackPack {
  id: string;
  name: string;
  description: string;
  lessons: Lesson[];
}

export interface ResourceDoc {
  id: string;
  title: string;
  markdown: string;
}

export interface ReviewState {
  stage: number;
  due: string;
}

export interface SaveState {
  version: 1;
  playerName: string;
  completed: Record<string, string>;
  earnedXp: Record<string, number>;
  attempts: Record<string, number>;
  work: Record<string, string>;
  reviews: Record<string, ReviewState>;
  streak: number;
  lastActive: string | null;
  selectedTrack: string;
}

export type View =
  | "home"
  | "journey"
  | "reviews"
  | "library"
  | "settings"
  | "mission"
  | "practice";
