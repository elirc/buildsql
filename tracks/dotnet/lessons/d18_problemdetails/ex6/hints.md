## Hint 1

One value, read once at the top of the handler, used in two places:
`http.TraceIdentifier` is unique per request and already there.

## Hint 2

`http.Response.Headers["X-Trace-Id"] = traceId;` before either return, so the
success path gets one too - by the time you know a request was interesting it
has already finished.

Then pass the same string into the problem as an extension:
`extensions: new Dictionary<string, object?> { ["traceId"] = traceId }`. The
header and the body value must be equal, or the number a user reads out finds
nothing in your logs.
