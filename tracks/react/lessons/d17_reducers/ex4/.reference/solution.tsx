// d17_reducers / ex4 - reference solution.
import { useReducer } from "react";

export type BudgetState = { remaining: number };

type BudgetAction = { type: "spent"; amount: number };

function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  return { remaining: state.remaining - action.amount };
}

export function BudgetPlanner({
  plan,
  label,
  parsePlan,
}: {
  plan: string;
  label: string;
  parsePlan: (plan: string) => BudgetState;
}) {
  // Three arguments, not two: the argument and the function that turns it into
  // the initial state. React calls parsePlan(plan) once, on mount - passing
  // parsePlan(plan) directly would run it on every render instead.
  const [state, dispatch] = useReducer(budgetReducer, plan, parsePlan);

  return (
    <>
      <p>{label}</p>
      <p role="status">Remaining: {state.remaining}</p>
      <button type="button" onClick={() => dispatch({ type: "spent", amount: 10 })}>
        Spend 10
      </button>
    </>
  );
}
