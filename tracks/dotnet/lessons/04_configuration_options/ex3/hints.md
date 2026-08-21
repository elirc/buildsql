## Hint 1

Nothing to register here — both `IHostEnvironment` and `IConfiguration` are
already in the container, put there by the host itself. The whole exercise is
one `TypedResults.Ok(...)` with three values in it.

Two of them come from the environment object and one from configuration.

## Hint 2

`IHostEnvironment` has an `EnvironmentName` property and a set of extension
methods — `IsDevelopment()`, `IsStaging()`, `IsProduction()` — that do the
comparison for you. Use the method; the gate boots a second host in Staging,
and a string comparison you wrote by hand is where a typo hides.

For the title, `configuration["Dojo:Catalog:Title"]` is a plain indexer lookup
and returns `string?`, so you need a fallback for the null.

## Hint 3

```csharp
private static IResult GetEnvironment(IHostEnvironment environment, IConfiguration configuration) =>
    TypedResults.Ok(new EnvironmentResponse(
        environment.EnvironmentName,
        environment./* … */(),
        configuration[/* … */] ?? ""));
```

The record `EnvironmentResponse` is already declared with the three properties
in the order the gate reads them.
