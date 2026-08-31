## Hint 1

Run it as shipped and read the trace: one entry. Two middlewares were registered
and neither of them ran, and nothing warned you.

Look at what `Run` takes as an argument compared with `Use`. One of them has a
`next` and one does not.

## Hint 2

`Run` is terminal — it never calls `next`, so everything registered after it is
unreachable. Move it to the bottom:

```csharp
pipeline.UseMiddleware<MarkMiddleware>("outer");
pipeline.UseMiddleware<MarkMiddleware>("inner");
pipeline.Run(D06Pipeline.Handler);
```

The rule is one line: terminal delegates last, always. In a real application the
same mistake looks like an `app.Run(...)` left in from debugging, or routing
registered after something that already terminated.
