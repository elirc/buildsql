## Hint 1

Read the two interfaces and ask, for each one, *who owns this?*

`ICorrelation` is described as "an id that identifies one request while it is
being handled". `IAuditTrail` is "a log that outlives every request". Those two
sentences are the two registrations; the current file has them the wrong way
round.

## Hint 2

The endpoint has to call `Record` and use what it gives back — it returns the
running total, so you do not need to count anything yourself. That means the
handler body is two statements, not one expression.

Do not change `AuditTrail`. It already locks, because a singleton is touched by
every request at once.

## Hint 3

```csharp
private static IResult Audit(ICorrelation correlation, IAuditTrail trail)
{
    int seen = trail.Record(correlation.Id);
    return TypedResults.Ok(new AuditResponse(correlation.Id, seen));
}
```

For the registrations: swap the two lifetimes. The one that is currently
`AddSingleton` should be per-request, and the one that is currently `AddScoped`
should be application-wide. If `seen` comes back as 1 twice, you changed only
one of them.
