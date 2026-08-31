## Hint 1

This branch is an *alternative*, not an addition: a matching request must never
see `common` or the shared handler. That is the other branching method — the one
that does not rejoin.

Because it never comes back, the branch has to end somewhere itself.

## Hint 2

```csharp
pipeline.MapWhen(
    context => context.Request.Query.ContainsKey("beta"),
    branch =>
    {
        branch.UseMiddleware<MarkMiddleware>("beta");
        branch.Run(context => { D06Trace.Mark(context, "beta-handler"); return Task.CompletedTask; });
    });
```

The `Run` inside the branch is not optional: a `MapWhen` branch that never
terminates produces a 404, which is a confusing way to find out.

Register it before the `common` marker so a non-matching request still gets the
main pipeline unchanged.
