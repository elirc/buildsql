// 02_event_loop / challenge - be the event loop.
// See lessons/02_event_loop/README.md, "Challenge".

export type TaskKind = "sync" | "nextTick" | "micro" | "timer";

export interface Task {
  kind: TaskKind;
  label: string;
  /** Scheduled, in order, at the moment this task runs. */
  spawns?: Task[];
}

export function predictTaskOrder(tasks: Task[]): string[] {
  throw new Error("challenge: predictTaskOrder() is not implemented yet - edit this file.");
}
