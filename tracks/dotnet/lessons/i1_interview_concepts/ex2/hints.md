## Hint 1

Both middlewares work. Neither needs editing. The bug is entirely in the order
they are added.

Play the rejected request through the pipeline in your head: the gate runs, finds
no API key, sets 401 and returns without calling `next`. Now ask what did not
happen.

## Hint 2

A middleware that does not call `next` stops everything downstream of it. So
anything that has to see *every* request — auditing, metrics, tracing, correlation
ids — must be *upstream* of anything that can reject one.

The first middleware added is the outermost.

## Hint 3

Swap the two lines in `Configure`:

```csharp
pipeline.UseMiddleware<AuditMiddleware>();
pipeline.UseMiddleware<GateMiddleware>();
```

If the count comes back as 0 rather than 1, the audit middleware is still inside
the gate. If it comes back as 2 after the first request, something is auditing
`/i1/audit-count` as well — check that only the pipeline is mounted on
`/i1/pipeline/…`.
