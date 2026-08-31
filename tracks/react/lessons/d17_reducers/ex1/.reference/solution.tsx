// d17_reducers / ex1 - reference solution.

export type WizardState = { step: number; total: number };

export type WizardAction = { type: "next" } | { type: "back" } | { type: "reset" };

/** The next step, clamped to the wizard's ends. */
function moveTo(state: WizardState, step: number): WizardState {
  const wanted = Math.min(Math.max(step, 0), state.total - 1);
  // Nothing to do is a real answer, and saying it by handing back the same
  // object lets React skip the render entirely.
  if (wanted === state.step) return state;
  return { ...state, step: wanted };
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "next":
      return moveTo(state, state.step + 1);
    case "back":
      return moveTo(state, state.step - 1);
    case "reset":
      return moveTo(state, 0);
  }
}
