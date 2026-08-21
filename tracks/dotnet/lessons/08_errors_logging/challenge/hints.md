## Hint 1

Structurally this is ex1 with a log call added to each `catch`. Write it that way
first and get the status codes green.

Then go back and choose the level for each branch by asking one question: *who
needs to do something about this, and how soon?*

## Hint 2

Two of the three exceptions are the caller getting it wrong. Those are normal
traffic for a public API, and they belong at `LogWarning` — visible in a trend,
not in an alert. The third is your own code failing, and that is `LogError`, with
the exception object attached.

The 400 branch is a validation problem rather than a plain one:

```csharp
await Results.ValidationProblem(
        new Dictionary<string, string[]> { [ex.Field] = [ex.Message] })
    .ExecuteAsync(context);
```

`ex.Field` is on `ValidationFailedException` — the gate checks that the `errors`
object is keyed by it.

## Hint 3

Pull the path out once at the top so every branch can use it:

```csharp
string path = context.Request.Path.Value ?? "";
```

…and give every log call a `{Path}` placeholder fed from it. The three calls are:

```csharp
logger.LogWarning("Not found on {Path}: {Reason}", path, ex.Message);
logger.LogWarning("Invalid request on {Path}: {Reason}", path, ex.Message);
logger.LogError(ex, "Unhandled exception on {Path}", path);
```

Only the last one takes the exception, because only the last one is a failure
whose stack trace anybody wants.
