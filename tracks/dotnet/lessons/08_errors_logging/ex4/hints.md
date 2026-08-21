## Hint 1

Three phases, and the first one happens before anything can throw:

1. work out the correlation id and put it on the response header
2. `await next(context)` inside a `try`
3. in the `catch`, log with the id and answer 500 with the id in the body

Phase 1 must be outside the `try`, or a successful request never gets a header —
and once the response has started you cannot add one.

## Hint 2

The id is the client's `X-Correlation-Id` if they sent a non-empty one, and
`Guid.NewGuid().ToString()` otherwise. That is lesson 03's challenge middleware
again.

For the log, `logger.LogError(ex, "…{CorrelationId}", correlationId)` — the
property name is what the gate looks for.

For the body, `Results.Problem` takes an `extensions:` parameter:
`extensions: new Dictionary<string, object?> { ["correlationId"] = correlationId }`.
Note the lowercase key: extension members are written into the JSON exactly as
you name them, with no camelCase conversion.

## Hint 3

```csharp
string incoming = context.Request.Headers[HeaderName].FirstOrDefault() ?? "";
string correlationId = incoming.Length > 0 ? incoming : Guid.NewGuid().ToString();
context.Response.Headers[HeaderName] = correlationId;

try
{
    await next(context);
}
catch (Exception ex)
{
    logger.LogError(ex, "Unhandled exception, correlation {CorrelationId}", correlationId);
    await Results.Problem(/* … */, extensions: /* … */).ExecuteAsync(context);
}
```

The header and the `correlationId` in the body must be the *same variable* — the
gate compares them, because a document whose id does not match its header helps
nobody.
