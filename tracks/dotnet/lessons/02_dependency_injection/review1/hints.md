## Hint 1

The endpoint is one line: return the unit of work's `Id` and the log's current
`Count`, wrapped in `UnitOfWorkResponse`.

The interesting part is that you never call `Dispose` yourself. Something else
does — and the question this exercise asks is *when*.

## Hint 2

The container disposes the `IDisposable` objects it created, at the moment the
scope that created them ends. So for the count to go up once per finished
request, the unit of work has to be something the container builds once per
request.

It is currently registered as a singleton, which is disposed exactly once — at
application shutdown, long after these three requests.

## Hint 3

```csharp
services.AddScoped<IUnitOfWork, UnitOfWork>();
```

and

```csharp
private static IResult GetUnitOfWork(IUnitOfWork work, IDisposalLog log) =>
    TypedResults.Ok(new UnitOfWorkResponse(work.Id, log.Count));
```

Note why the first request reports 0 and not 1: its own unit of work is still
alive while the response is being written, and is disposed after your handler
returns.
