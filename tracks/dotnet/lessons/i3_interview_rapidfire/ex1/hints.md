## Hint 1

Three registrations, three different methods, and the interface names are the
specification: application-wide, per-request, per-call.

Nothing else in the file needs touching.

## Hint 2

- one object for the whole application → `AddSingleton`
- one object per request → `AddScoped`
- a new object every time anyone resolves it → `AddTransient`

Only one of the three lines currently in the file is already correct.

## Hint 3

```csharp
services.AddSingleton<IAppWide, AppWide>();
services.AddScoped<IPerRequest, PerRequest>();
services.AddTransient<IPerCall, PerCall>();
```

Before you run it, predict which assertion the *current* code fails and why —
that prediction is the thing being practised, not the three lines.
