// d17_reducers / ex7 - a reducer that wraps a reducer.
// See tracks/react/lessons/d17_reducers/README.md, "Exercise 7".

export type History<S> = { past: S[]; present: S; future: S[] };

export type HistoryAction = { type: "undo" } | { type: "redo" };

export function withHistory<S, A extends { type: string }>(
  reducer: (state: S, action: A) => S,
): (state: History<S>, action: A | HistoryAction) => History<S> {
  return (state, action) => {
    if (action.type === "undo") {
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }

    if (action.type === "redo") {
      const [next, ...rest] = state.future;
      return { past: [...state.past, state.present], present: next, future: rest };
    }

    const present = reducer(state.present, action as A);
    return { past: [...state.past, state.present], present, future: state.future };
  };
}
