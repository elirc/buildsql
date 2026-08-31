## Hint 1

Three calls, and the exercise is what each one does to the *list* of
registrations behind `IGreeter`. One of them appends. One of them appends again.
One of them looks first and does nothing.

Order matters for two of the three checks.

## Hint 2

```csharp
services.AddSingleton<IGreeter, FormalGreeter>();
services.AddSingleton<IGreeter, CasualGreeter>();
services.TryAddSingleton<IGreeter, LoudGreeter>();
```

`TryAdd…` lives in `Microsoft.Extensions.DependencyInjection.Extensions`, so the
file needs that `using`.

The three facts being drilled: `Add` appends rather than replaces; a single
resolve gets the **last** registration; `IEnumerable<IGreeter>` gets **all** of
them in the order they were added. `TryAdd` does nothing because `IGreeter`
already has registrations — which is exactly how framework defaults get out of
your way.
