## Hint 1

Three calls, and you need one that appends *unless this exact implementation is
already in the set*. `Add` always appends. `TryAdd` would refuse the second
check too, because by then something is registered for `IStartupCheck`.

There is a third method, and it compares implementation types.

## Hint 2

```csharp
services.TryAddEnumerable(ServiceDescriptor.Singleton<IStartupCheck, DiskCheck>());
```

…three times, with `DiskCheck`, `ClockCheck`, `DiskCheck`. The third is a no-op.

It takes a `ServiceDescriptor` rather than type arguments precisely because it
has to look at the implementation type to decide. `TryAddEnumerable` lives in
`Microsoft.Extensions.DependencyInjection.Extensions`, so the file needs that
`using`.

This is the registration method for any set two independent modules might both
want to contribute to.
