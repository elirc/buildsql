## Hint 1

The stub's guard is correct and it is in one place — the last one. Count the
awaits between the effect starting and that check: each one is a gap in which
the user can move on, and only the last gap is being watched.

## Hint 2

Ask the question again at every point where the chain is about to spend
something: before the second request goes out, and before the result reaches
state. Returning early from inside a `then` callback simply stops the chain.

## Hint 3

Keep exactly one flag for the whole effect run — the cleanup that retires this
trip retires both of its steps at once. Two flags, one per request, is more
bookkeeping for the same behaviour.
