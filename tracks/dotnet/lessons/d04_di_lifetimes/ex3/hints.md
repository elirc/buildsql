## Hint 1

Run it first and read the 500. The container is telling you something precise: a
scoped service cannot be resolved from the provider a singleton was built with,
because that provider *is* the root and the root has no scope.

So the runner has to get a scope from somewhere. It cannot borrow the request's
— it is a singleton and does not know one exists.

## Hint 2

Inject `IServiceScopeFactory` instead of `IServiceProvider`. It is a singleton
itself, so a singleton may hold one safely, and it exists precisely to hand
long-lived objects a short-lived scope.

```csharp
using var scope = scopes.CreateScope();
return scope.ServiceProvider.GetRequiredService<IJobUnit>().Id;
```

The `using` is not decoration: a scope you create is a scope you own, and
everything resolved inside it is disposed when you dispose it.

This is exactly how a `BackgroundService` gets a `DbContext`.
