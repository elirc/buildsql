## Hint 1

Go through the four requirements one at a time and ask, for each: is this
something I have to implement, or something `.then` already guarantees?

- returns a new promise rather than mutating the old one
- a handler that throws produces a rejection
- a handler that returns a promise is adopted rather than nested
- with no rejection handler, a rejected input passes through

## Hint 2

All four are `.then`. The answer is one line, and the exercise is being sure
enough of the semantics to write one line instead of fifteen.

If you reached for `new Promise((resolve, reject) => ...)` around a promise you
already have, that is the "explicit construction antipattern" — worth being able
to name, because interviewers ask about it and because the hand-rolled version
almost always drops one of the four rules above.
