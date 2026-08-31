## Hint 1

Two `Map…` calls, one per verb, on the same template. The two handlers are
already written for you to fill in; the mapping is the part that is missing.

Resist the urge to map the path once and switch on `context.Request.Method` —
the last two checks in the gate exist to catch exactly that.

## Hint 2

`app.MapPut(template, Watch)` and `app.MapDelete(template, Unwatch)`.

Both handlers answer `TypedResults.NoContent()` when a stop with that id exists
and `TypedResults.NotFound()` when it does not. `Network.Stops.Any(...)` is
enough — you do not need the stop itself.

The 405s then happen without you: routing sees candidates for the path, none of
which accept POST, and says so.
