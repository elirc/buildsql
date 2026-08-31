## Hint 1

`ExportJob` is not registered, and it never will be — it needs a label that only
the caller knows. But it also needs an `IClock`, which only the container knows.

There is a helper whose entire job is "build this unregistered type, take what
you can from DI, and use the arguments I hand you for the rest".

## Hint 2

```csharp
public ExportJob Create(string label) =>
    ActivatorUtilities.CreateInstance<ExportJob>(services, label);
```

The extra arguments are matched to constructor parameters **by type**, and
everything left over is resolved from the provider — so `label` fills the
`string` and `IClock` comes from the container.

The gate checks the clock is the container's singleton, so `new ExportJob(new
FixedClock(), label)` fails: it works today and breaks the moment the clock has
a dependency of its own.

If you were creating thousands of these, `ActivatorUtilities.CreateFactory`
compiles the same logic once.
