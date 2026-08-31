// d17_reducers / ex3 - a total kept beside the numbers it is the total of.
// See tracks/react/lessons/d17_reducers/README.md, "Exercise 3".
import { useReducer } from "react";

type PollState = { counts: Record<string, number>; total: number };

type PollAction = { type: "voted"; option: string } | { type: "reset" };

function pollReducer(state: PollState, action: PollAction): PollState {
  switch (action.type) {
    case "voted":
      return {
        ...state,
        counts: { ...state.counts, [action.option]: (state.counts[action.option] ?? 0) + 1 },
      };
    case "reset": {
      const cleared: Record<string, number> = {};
      for (const option of Object.keys(state.counts)) cleared[option] = 0;
      return { counts: cleared, total: 0 };
    }
  }
}

export function PollPanel({ options }: { options: string[] }) {
  const [state, dispatch] = useReducer(pollReducer, options, (list) => ({
    counts: Object.fromEntries(list.map((option) => [option, 0])),
    total: 0,
  }));

  return (
    <>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => dispatch({ type: "voted", option })}
        >
          Vote for {option}
        </button>
      ))}
      <button type="button" onClick={() => dispatch({ type: "reset" })}>
        Reset
      </button>
      <ul>
        {options.map((option) => (
          <li key={option}>
            {option}: {state.counts[option] ?? 0}
          </li>
        ))}
      </ul>
      <p role="status">
        {state.total} {state.total === 1 ? "vote" : "votes"}
      </p>
    </>
  );
}
