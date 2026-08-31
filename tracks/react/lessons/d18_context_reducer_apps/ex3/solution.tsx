// d18_context_reducer_apps / ex3 - a Next button that does not know what it needs.
// See tracks/react/lessons/d18_context_reducer_apps/README.md, "Exercise 3".
import {
  createContext,
  useContext,
  useId,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

type FlowState = { step: number; email: string };

type FlowAction = { type: "emailChanged"; email: string } | { type: "next" } | { type: "back" };

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "emailChanged":
      return { ...state, email: action.email };
    case "next":
      return state.step >= 2 ? state : { ...state, step: state.step + 1 };
    case "back":
      return state.step <= 0 ? state : { ...state, step: state.step - 1 };
  }
}

const FlowContext = createContext<{
  state: FlowState;
  canNext: boolean;
  canBack: boolean;
  dispatch: Dispatch<FlowAction>;
} | null>(null);

function useFlow() {
  const value = useContext(FlowContext);
  if (value === null) throw new Error("useFlow must be used inside a FlowProvider");
  return value;
}

export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(flowReducer, { step: 0, email: "" });

  const canNext = state.step < 2;
  const canBack = state.step > 0;

  return (
    <FlowContext.Provider value={{ state, canNext, canBack, dispatch }}>
      {children}
    </FlowContext.Provider>
  );
}

export function FlowSteps() {
  const id = useId();
  const { state, dispatch } = useFlow();

  if (state.step === 0) {
    return (
      <>
        <label htmlFor={id}>Email</label>
        <input
          id={id}
          value={state.email}
          onChange={(event) => dispatch({ type: "emailChanged", email: event.target.value })}
        />
      </>
    );
  }
  if (state.step === 1) {
    return <p role="status">Confirm {state.email}</p>;
  }
  return <p role="status">Done</p>;
}

export function FlowNav() {
  const { canNext, canBack, dispatch } = useFlow();
  return (
    <>
      <button type="button" disabled={!canBack} onClick={() => dispatch({ type: "back" })}>
        Back
      </button>
      <button type="button" disabled={!canNext} onClick={() => dispatch({ type: "next" })}>
        Next
      </button>
    </>
  );
}
