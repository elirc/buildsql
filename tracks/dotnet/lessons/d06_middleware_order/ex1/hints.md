## Hint 1

Read the two requirements as sentences about wrapping. "Timing must measure
everything" means timing wraps the other two. "Auth must run before the cache is
consulted" means auth wraps the cache.

That fixes all three positions without you having to think about the trace at
all.

## Hint 2

The first middleware registered is the outermost, so the registration order is
the same as the wrapping order: timing, auth, cache.

The trace then falls out: each one marks `>` on the way in, in that order, and
`<` on the way out, in reverse. A pipeline is a stack of nested calls, not a
queue.
