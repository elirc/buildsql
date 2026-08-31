// d20_custom_hooks_2 / ex7 - a log that is always one action behind.
// See tracks/react/lessons/d20_custom_hooks_2/README.md, "Exercise 7".
import { useReducer } from "react";

export function useLoggedReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initial: S,
  log: (action: A, next: S) => void,
): [S, (action: A) => void] {
  const [state, rawDispatch] = useReducer(reducer, initial);

  function dispatch(action: A) {
    log(action, state);
    rawDispatch(action);
  }

  return [state, dispatch];
}
