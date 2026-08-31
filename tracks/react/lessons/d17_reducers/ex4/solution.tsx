// d17_reducers / ex4 - the initial state is worked out every single render.
// See tracks/react/lessons/d17_reducers/README.md, "Exercise 4".
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
  const [state, dispatch] = useReducer(budgetReducer, parsePlan(plan));

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
