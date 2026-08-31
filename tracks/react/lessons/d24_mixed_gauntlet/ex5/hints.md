## Hint 1

The reducer is written and correct. Two things about the hook around it are
not: the total is a `useState` that nothing ever sets, and the two functions
are rebuilt on every render.

## Hint 2

A total is a question about the lines, so answer it while rendering rather than
storing it — then no future action can forget to keep it in step.

## Hint 3

For the functions, remember what `useReducer` guarantees: `dispatch` never
changes identity. That means both wrappers can be `useCallback` with empty
dependency arrays, and the hook's API becomes something a memoized consumer can
actually rely on.
