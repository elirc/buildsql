// d17_reducers / ex7 - reference solution.

export type History<S> = { past: S[]; present: S; future: S[] };

export type HistoryAction = { type: "undo" } | { type: "redo" };

/**
 * Wraps any reducer in past/present/future. The wrapped reducer never learns
 * that it has been wrapped - which is only possible because a reducer is a
 * plain function of two arguments.
 */
export function withHistory<S, A extends { type: string }>(
  reducer: (state: S, action: A) => S,
): (state: History<S>, action: A | HistoryAction) => History<S> {
  return (state, action) => {
    if (action.type === "undo") {
      if (state.past.length === 0) return state;
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future],
      };
    }

    if (action.type === "redo") {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return { past: [...state.past, state.present], present: next, future: rest };
    }

    const present = reducer(state.present, action as A);
    // The inner reducer says "nothing happened" by handing its state back, and
    // nothing that happened is nothing to undo.
    if (present === state.present) return state;

    // Doing something new abandons the branch you had undone your way out of.
    return { past: [...state.past, state.present], present, future: [] };
  };
}
