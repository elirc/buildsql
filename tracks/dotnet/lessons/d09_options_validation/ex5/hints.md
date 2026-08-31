## Hint 1

`AddOptions<T>()` has an overload that takes a **name**, and each named
registration binds and validates independently. Loop over `Ex5Services.Names`
and register one per name.

Then the endpoint. `IOptionsSnapshot<T>.Get(name)` looks the instance up — and it
is far more forgiving than you want it to be.

## Hint 2

```csharp
foreach (string name in Names)
{
    services.AddOptions<FeedOptions>(name)
        .BindConfiguration($"Dojo:D09:Feeds:{name}")
        .Validate(options => !string.IsNullOrWhiteSpace(options.Url), "Url is required.");
}
```

In the handler, check `Ex5Services.Names.Contains(name)` **first** and return
`TypedResults.NotFound()` if not: `Get("nope")` does not throw, it invents an
unbound instance with defaults and hands it over.

Then `D09Options.Read(() => feeds.Get(name), value => …)` — the given helper
turns the validation failure into the 500 for you.

## Hint 3

The check the gate is really making is that validation is **per named
instance**: primary answers 200 while backup answers 500, from one options
class. That is what makes named options the right tool for "the same settings,
several times" — two feeds, several tenants, a set of named HTTP clients.

`IOptionsSnapshot<T>` is scoped, which is why it is safe to re-evaluate per
request. A singleton would need `IOptionsMonitor<T>.Get(name)` instead.

Left for you: the loop, the existence check, and deciding what should happen if
`Names` ever came from configuration rather than a constant.
