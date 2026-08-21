## Hint 1

Two lines in two different places. One in `Register` that tells the container
"this class describes that section", and one in the handler that hands the
bound object back.

Open `src/Api/appsettings.json` and find the section first — the path matters
and it has two levels.

## Hint 2

`services.Configure<TOptions>(IConfiguration section)` is the registration.
The section comes from `configuration.GetSection("…")`, and the argument is the
full colon-separated path, not just the last segment.

In the handler, `IOptions<T>` is a wrapper: the object you want is one property
away.

## Hint 3

```csharp
services.Configure<CatalogOptions>(configuration.GetSection(/* … */));
```

and

```csharp
private static IResult GetCatalogOptions(IOptions<CatalogOptions> options) =>
    TypedResults.Ok(options.Value);
```

You can return the options object directly — the serialiser turns its three
properties into the three JSON fields the gate wants. If every value comes back
empty or zero, the section path is wrong; binding a section that does not exist
is silent.
