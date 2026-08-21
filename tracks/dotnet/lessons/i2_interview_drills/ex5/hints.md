## Hint 1

Structure first: correlation id and response header **before** the `try`, then
`await next(context)` inside it, then two `catch` blocks.

Putting the id outside the `try` is not tidiness — successful responses need it
too, and once the response has started you cannot add a header at all.

## Hint 2

Build the extensions dictionary once and use it in both catches:

```csharp
var extensions = new Dictionary<string, object?> { ["correlationId"] = correlationId };
```

`Results.Problem(title:, detail:, statusCode:, extensions:)` takes it, and in
middleware you run the result yourself with `.ExecuteAsync(context)`.

The two log calls differ in more than level: only the 500 branch passes the
exception object, because only the 500 branch has a stack trace anybody wants.
Both need `{CorrelationId}` as a named placeholder.

## Hint 3

```csharp
catch (DrillNotFoundException ex)
{
    logger.LogWarning("Not found on {Path}, correlation {CorrelationId}",
        context.Request.Path.Value, correlationId);

    await Results.Problem(
            title: "Not Found",
            detail: ex.Message,
            statusCode: StatusCodes.Status404NotFound,
            extensions: extensions)
        .ExecuteAsync(context);
}
```

…and the `catch (Exception ex)` below it uses `logger.LogError(ex, …)`, a 500,
a generic title, and **no** `detail:` argument at all. Leaving that argument out
is what keeps the secret in `DrillTrap.Secret` out of the response.
