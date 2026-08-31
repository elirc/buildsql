## Hint 1

Unlike ex5, this one *wants* every source flowing at once — that is what makes
it a merge. Attach a `data` listener to each source and forward every item into
one hand-built object-mode Readable.

## Hint 2

The end condition is a countdown, not an event: keep a counter of sources still
open, decrement on each `end`, and `push(null)` only when it reaches zero.
Ending the merge when the *first* source ends is the classic version of this
bug, and it silently drops everything the slower sources still had.

## Hint 3

The error path has three jobs, and each one is checked: propagate the first
error into the merged stream (`merged.destroy(error)`), destroy the **other**
sources so they stop producing into a stream nobody reads, and ignore any
second error — a destroyed stream must not be destroyed again with a different
reason. A guard boolean covers the last two. What to do about backpressure when
a consumer is slower than the sources is deliberately out of scope here; that is
d17's whole subject.
