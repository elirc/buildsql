## Hint 1

`Pricer`'s constructor takes an `int`. The container has no idea which int, so
the type-based registration cannot work — you have to build the object yourself,
in a lambda the container calls when it needs one.

That lambda is handed the thing you need to look the value up in.

## Hint 2

The factory overload gives you an `IServiceProvider`:

```csharp
services.AddSingleton<IPricer>(sp => new Pricer(sp.GetRequiredService<IRateSource>().Cents));
```

The lambda runs once, because the registration is a singleton — the rate is read
at first use and captured, which is the right behaviour for a value that does
not change.

Anything you construct in there is owned by the container, so an `IDisposable`
result is still disposed with the scope that created it.
