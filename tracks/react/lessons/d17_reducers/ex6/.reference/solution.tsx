// d17_reducers / ex6 - reference solution.

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

// Every case asks the same question first: is this action legal from where the
// job is now? An illegal one is not an error, it is simply nothing happening.
export function jobReducer(state: JobState, action: JobAction): JobState {
  switch (action.type) {
    case "started":
      return state.status === "idle" ? { status: "running", progress: 0 } : state;

    case "paused":
      return state.status === "running" ? { ...state, status: "paused" } : state;

    case "resumed":
      return state.status === "paused" ? { ...state, status: "running" } : state;

    case "progressed":
      return state.status === "running"
        ? { ...state, progress: Math.min(state.progress + action.by, 100) }
        : state;

    case "finished":
      return state.status === "running" ? { status: "done", progress: 100 } : state;

    case "reset":
      return state.status === "idle" && state.progress === 0
        ? state
        : { status: "idle", progress: 0 };
  }
}
