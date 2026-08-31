## Hint 1

Nothing new - every habit from ex1 to ex7, all required at once. Inject
`ILogger<Ex8>`, read `http.TraceIdentifier` into a local, and put exactly one
log call on each of the four paths.

## Hint 2

`pick.Lines.FirstOrDefault(l => l.OnHand < l.Wanted)` finds the shortage. It is
a 409 and a `LogWarning` - the request was valid, the pick exists, and the shelf
disagrees with the system. That combination is the one people mis-level.

## Hint 3

`D19Packing.Pack(pick)` goes in a `try`: pick 43 jams the feeder, and the
exception message carries a token. `LogError(ex, ...)` with the exception in its
own parameter, and a `ProblemDetails` whose detail names nothing.

Every one of the four entries carries `{TraceId}` - the success included,
because by the time you know a request was interesting it has already finished.
