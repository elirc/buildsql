## Hint 1

The route already hands you the id — the whole exercise is the two-branch answer
that follows. One of the five stops has that id, or none of them does, and those
two cases get different status codes.

Do not touch the `{id:int}` constraint. The last check in the gate is about what
that constraint already does for you.

## Hint 2

`Network.Stops.FirstOrDefault(...)` gives you the stop or `null`. `First` throws,
and a thrown exception is a 500, not a 404.

Then `TypedResults.NotFound()` or `TypedResults.Ok(stop)`. Both branches must be
returned from the same method, so let the null check pick between them rather
than returning `Ok` and hoping.
