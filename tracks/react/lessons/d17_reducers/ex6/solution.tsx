// d17_reducers / ex6 - every action allowed from everywhere.
// See tracks/react/lessons/d17_reducers/README.md, "Exercise 6".

export type JobState = {
  status: "idle" | "running" | "paused" | "done";
  progress: number;
};

export type JobAction =
  | { type: "started" }
  | { type: "paused" }
  | { type: "resumed" }
  | { type: "progressed"; by: number }
  | { type: "finished" }
  | { type: "reset" };

export function jobReducer(state: JobState, action: JobAction): JobState {
  switch (action.type) {
    case "started":
      return { status: "running", progress: 0 };
    case "paused":
      return { ...state, status: "paused" };
    case "resumed":
      return { ...state, status: "running" };
    case "progressed":
      return { ...state, progress: state.progress + action.by };
    case "finished":
      return { status: "done", progress: 100 };
    case "reset":
      return { status: "idle", progress: 0 };
  }
}
