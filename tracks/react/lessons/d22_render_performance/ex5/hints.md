## Hint 1

React already knows how to do nothing: when the state you set is the same value
as the state it holds, it bails out and does not render. Ask why that never
happens here — what does `{ name: option }` produce that `option` would not?

## Hint 2

The state is a choice between three strings, so the simplest thing that can
represent it is a string. Then picking Beans while Beans is picked really is
setting the same value, and React skips the render for free.

## Hint 3

If you needed an object here for other reasons, the same effect takes a guard —
returning the current state from an updater when nothing changed. Storing the
smallest value that says what you mean is simply cheaper than remembering to
write that guard.
