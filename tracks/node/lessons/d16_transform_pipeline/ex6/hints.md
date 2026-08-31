## Hint 1

You cannot pipe one readable into two sinks and expect both to see everything —
reading a stream consumes it, so the two would race for chunks. Give each sink
its own `PassThrough` branch, wire branch to sink with `pipeline()`, and write
each chunk into every branch yourself.

## Hint 2

Three promises to keep track of: the pump (a `for await` over the source that
writes into every branch and ends them all at the end) and one `pipeline()` per
branch. `Promise.all` over the lot gives you both "all finished" and "the first
failure", which are exactly the two outcomes you owe the caller.

The teardown is the part reviewers look for: on any failure, destroy the source,
the branches and every sink — including the ones that were behaving. A sink left
open holds its file handle, and a half-written file that was never destroyed
looks complete to whatever reads it next.

Attach a no-op `.catch()` to every one of those promises before you await them
together. When the teardown destroys a stream its `pipeline()` rejects too, and
without a handler that becomes an unhandled rejection warning on the way out.
