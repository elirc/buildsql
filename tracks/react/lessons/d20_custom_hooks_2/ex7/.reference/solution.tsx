// d20_custom_hooks_2 / ex7 - reference solution.
import { useCallback, useEffect, useReducer, useRef } from "react";

export function useLoggedReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initial: S,
  log: (action: A, next: S) => void,
): [S, (action: A) => void] {
  const [state, rawDispatch] = useReducer(reducer, initial);

  // The state as it is *now*, written synchronously when an action is
  // dispatched rather than after the render that shows it.
  const currentState = useRef(initial);
  const reducerRef = useRef(reducer);
  const logRef = useRef(log);

  useEffect(() => {
    reducerRef.current = reducer;
    logRef.current = log;
  });

  const dispatch = useCallback((action: A) => {
    // A reducer is pure, so calling it here to find out what happens next
    // costs nothing and changes nothing.
    const next = reducerRef.current(currentState.current, action);
    currentState.current = next;
    logRef.current(action, next);
    rawDispatch(action);
    // Everything that can change lives in a ref, so this dispatch is as stable
    // as the one React gave us - which is the promise the wrapper has to keep.
  }, []);

  return [state, dispatch];
}
