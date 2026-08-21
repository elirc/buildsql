## Hint 1

Three assertions, and two of them already pass. Run the gate and read which one
fails first — that tells you which of the three properties is broken, and the
other two tell you what you are not allowed to break while fixing it.

Then look at `JobRunner`'s constructor and ask how many times the container calls
it.

## Hint 2

A singleton's constructor runs once, so whatever it is handed is kept forever.
That is the captive dependency, and the fix is not to change the runner's
lifetime — the `totalRuns` assertion exists to stop you doing that.

Move the `IRequestId` out of the constructor and into the method. `Run` will then
need to give back both the id it used and the new count, which a small record
does neatly.

One registration also has to change: the handler asks for `IRequestId` twice and
the gate requires both asks to give the same object.

## Hint 3

```csharp
public record JobRun(Guid RequestId, int TotalRuns);

public sealed class JobRunner : IJobRunner
{
    private int _runs;

    public JobRun Run(IRequestId requestId) =>
        new(requestId.Value, Interlocked.Increment(ref _runs));
}
```

…with `AddScoped<IRequestId, RequestId>()` and the runner still a singleton. The
handler takes `(IJobRunner runner, IRequestId requestId, IRequestId echo)`, calls
`runner.Run(requestId)`, and builds the response from the result plus
`echo.Value`.
