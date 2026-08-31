// d17_reducers / ex3 - reference solution.
import { useReducer } from "react";

// The state is the facts and nothing else. There is no `total` here, because a
// total is not a fact - it is an answer you can work out from the facts.
type PollState = Record<string, number>;

type PollAction = { type: "voted"; option: string } | { type: "reset" };

function pollReducer(state: PollState, action: PollAction): PollState {
  switch (action.type) {
    case "voted":
      return { ...state, [action.option]: (state[action.option] ?? 0) + 1 };
    case "reset": {
      const cleared: PollState = {};
      for (const option of Object.keys(state)) cleared[option] = 0;
      return cleared;
    }
  }
}

export function PollPanel({ options }: { options: string[] }) {
  const [counts, dispatch] = useReducer(pollReducer, options, (list) =>
    Object.fromEntries(list.map((option) => [option, 0])),
  );

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <>
      {options.map((option) => (
        <button key={option} type="button" onClick={() => dispatch({ type: "voted", option })}>
          Vote for {option}
        </button>
      ))}
      <button type="button" onClick={() => dispatch({ type: "reset" })}>
        Reset
      </button>
      <ul>
        {options.map((option) => (
          <li key={option}>
            {option}: {counts[option] ?? 0}
          </li>
        ))}
      </ul>
      <p role="status">
        {total} {total === 1 ? "vote" : "votes"}
      </p>
    </>
  );
}
