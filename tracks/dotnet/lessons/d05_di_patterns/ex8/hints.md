## Hint 1

`IServiceCollection` is a `List<ServiceDescriptor>` — you can read it, search it,
and remove from it, right up until the provider is built. That is the whole
trick: find the descriptor that is already there, take it out, and put back a
factory that builds the original and wraps it.

Write one small helper and call it twice.

## Hint 2

The shape of the helper:

```csharp
var existing = services.Last(d => d.ServiceType == typeof(IGreetingService));
services.Remove(existing);
services.AddSingleton<IGreetingService>(sp => wrap(sp, Build(sp, existing)));
```

`wrap` is a `Func<IServiceProvider, IGreetingService, IGreetingService>` so the
counting decorator can pull `IGreetCounter` out of the provider and the shouting
one can ignore it.

Call it with the shouting wrapper first and the counting wrapper second: each
call wraps whatever the previous one left, so the **last** one applied ends up
outermost.

## Hint 3

`Build` is the fiddly part, because a descriptor can carry any of three things:

```csharp
if (descriptor.ImplementationInstance is IGreetingService instance) return instance;
if (descriptor.ImplementationFactory is not null)
    return (IGreetingService)descriptor.ImplementationFactory(sp);
return (IGreetingService)ActivatorUtilities.CreateInstance(sp, descriptor.ImplementationType!);
```

The third line is why ex7 came first: the original implementation type is no
longer registered — you removed it — so the container cannot resolve it and you
have to construct it yourself.

Left for you: assembling the helper, and predicting the chain before you run it.
This is exactly what Scrutor's `Decorate` does, and writing it once is the point.
