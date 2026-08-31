// d17_reducers / ex8 - reference solution.
import { useEffect, useReducer } from "react";

type MonitorState = { alerts: string[]; hidden: number; muted: boolean };

type MonitorAction =
  | { type: "received"; text: string }
  | { type: "muteToggled" }
  | { type: "cleared" };

// One place decides what an arriving alert means, and it is handed the current
// state as an argument rather than closing over it.
function monitorReducer(state: MonitorState, action: MonitorAction): MonitorState {
  switch (action.type) {
    case "received":
      return state.muted
        ? { ...state, hidden: state.hidden + 1 }
        : { ...state, alerts: [...state.alerts, action.text] };
    case "muteToggled":
      return { ...state, muted: !state.muted };
    case "cleared":
      return { ...state, alerts: [], hidden: 0 };
  }
}

export function MonitorPanel({
  subscribe,
}: {
  subscribe: (onAlert: (text: string) => void) => () => void;
}) {
  const [state, dispatch] = useReducer(monitorReducer, {
    alerts: [],
    hidden: 0,
    muted: false,
  });

  // `dispatch` is guaranteed stable by React, so this effect depends only on
  // `subscribe` and never re-runs - one subscription, for the whole life of
  // the component, that nevertheless always acts on the current state.
  useEffect(() => subscribe((text) => dispatch({ type: "received", text })), [subscribe]);

  return (
    <>
      <ul>
        {state.alerts.map((alert, index) => (
          <li key={index}>{alert}</li>
        ))}
      </ul>
      <p role="status">{state.hidden} hidden while muted</p>
      <button type="button" onClick={() => dispatch({ type: "muteToggled" })}>
        {state.muted ? "Unmute" : "Mute"}
      </button>
      <button type="button" onClick={() => dispatch({ type: "cleared" })}>
        Clear
      </button>
    </>
  );
}
