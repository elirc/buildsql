## Hint 1

You are registering a *shape*, not a type: "for any T, `IRepository<T>` is an
`InMemoryRepository<T>`". The container can close the generic itself when
somebody asks for a particular T.

The generic `AddScoped<TService, TImplementation>()` form cannot express that.
There is another overload.

## Hint 2

```csharp
services.AddScoped(typeof(IRepository<>), typeof(InMemoryRepository<>));
```

`typeof(IRepository<>)` — with nothing between the angle brackets — is the open
generic type. This is exactly how `ILogger<T>` and `IOptions<T>` are registered.

Note the lifetime: scoped means one instance per closed form per request, which
is what makes the `SameInstance` check true. Open generics cannot be registered
with a factory lambda, so the two-`typeof` overload is the only route.
