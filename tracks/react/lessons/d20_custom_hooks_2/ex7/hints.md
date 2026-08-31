## Hint 1

`state` inside `dispatch` is the value from the render that created that
`dispatch` — the state *before* this action. The log is supposed to say what the
action produced, which is a value nobody has computed yet.

## Hint 2

You have the reducer, and a reducer is a pure function: calling it yourself to
find out what the next state will be is free and has no side effects. You need
the current state to call it with, though, and that has to be readable
synchronously — which is a ref rather than the render's variable.

## Hint 3

The other half is identity. `dispatch` from `useReducer` never changes, and a
wrapper that changes on every render breaks every consumer relying on that. Put
whatever can change — the reducer, the log function — in refs, and the wrapper
can have an empty dependency array.
