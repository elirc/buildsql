// d18_context_reducer_apps / ex3 - reference solution.
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

/** The one place that knows when a step is finished. */
function canLeave(state: FlowState): boolean {
  if (state.step === 0) return state.email.trim() !== "";
  return state.step < 2;
}

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "emailChanged":
      return { ...state, email: action.email };
    case "next":
      // The reducer enforces the rule as well as the button showing it: a
      // disabled button is a courtesy, not a guarantee.
      return canLeave(state) ? { ...state, step: state.step + 1 } : state;
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

  // Derived here, so a button in one branch of the tree can depend on a field
  // in another without either of them knowing the other exists.
  const canNext = canLeave(state);
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
