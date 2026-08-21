## Hint 1
A single number cannot be undone — once you overwrite it, the previous value is
gone. Ask what the *smallest* piece of information is that makes Undo possible,
and store that instead. The displayed count then stops being state and becomes
something you compute.

## Hint 2
Keep an array of every value the counter has had, starting `[0]`. The current
count is its last element. Increment and decrement *append*; Undo *removes the
last element*. Undo is disabled exactly when the array has one element left.

Remember state must be replaced, never mutated: `[...previous, next]` for the
append, `previous.slice(0, -1)` for the undo — `push` and `pop` change the array
in place and React will not notice.

## Hint 3
Both Increment and Decrement do the same thing to the history, differing only
in how they compute the next number from the last one, so a small helper that
takes that function keeps it to one place:

```tsx
function push(next: (current: number) => number) { … }
```

The remaining decision is where the clamp on Undo lives — as a `disabled`
attribute, as a guard inside the handler, or both — and what you want a
keyboard user to experience when there is nothing left to undo.
