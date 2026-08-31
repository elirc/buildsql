// d17_reducers / ex1 - a reducer that edits what it was given.
// See tracks/react/lessons/d17_reducers/README.md, "Exercise 1".

export type WizardState = { step: number; total: number };

export type WizardAction = { type: "next" } | { type: "back" } | { type: "reset" };

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "next":
      state.step += 1;
      return state;
    case "back":
      state.step -= 1;
      return state;
    case "reset":
      state.step = 0;
      return state;
  }
}
