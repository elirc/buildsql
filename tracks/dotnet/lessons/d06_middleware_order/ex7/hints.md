## Hint 1

Two placement questions, and answering them in order fixes all three lines.

First: a `try/catch` can only catch what happens *inside* the call it wraps, so
where must the catcher be relative to the thing that throws?

Second: `MarkMiddleware` writes its closing mark on the line after
`await next(...)` — which is skipped entirely if `next` throws. So where must
audit be for that line to still run?

## Hint 2

Audit outermost, then the catcher, then the risky one:

```csharp
pipeline.UseMiddleware<MarkMiddleware>("audit");
pipeline.UseMiddleware<CatchMiddleware>();
pipeline.UseMiddleware<RiskyMiddleware>();
```

The catcher swallows the exception and returns normally, so by the time control
reaches audit's post-`next` line there is nothing propagating and the mark runs.

The general lesson is worth writing down: code after `await next(...)` is **not**
a `finally`. If you need it to run on failures too, either wrap it in your own
`try/finally` or make sure something between you and the danger handles the
exception.
