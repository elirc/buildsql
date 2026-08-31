## Hint 1

`Capture` is a `try` that builds a successful `Attempt` and a `catch` that
builds a failed one. It has to catch broadly, because the caller asked for a
value rather than a throw - with exactly one exception, named in the summary.

`Unwrap` is the inverse, and `Then` is `Capture` with a guard in front.

## Hint 2

```csharp
try
{
    return new Attempt<T>(true, function(), null);
}
catch (OperationCanceledException)
{
    throw;                       // a cancellation is not a failure to record
}
catch (Exception ex)
{
    return new Attempt<T>(false, default, ex.Message);
}
```

The cancellation clause has to come first, because it is more specific. A
cancellation means somebody asked you to stop; recording it as a failure and
carrying on is the wrong response, and it is why `Task` treats cancelled as a
separate state from faulted rather than as an ordinary error.

## Hint 3

`Then` short-circuits:

```csharp
if (!attempt.Ok) { return new Attempt<TOut>(false, default, attempt.Error); }
return Capture(() => next(attempt.Value!));
```

Passing the *original* error through rather than inventing a new one is what
makes a chain of five steps report the first thing that went wrong instead of a
cascade of consequences.

Note why `Ok` is a separate field rather than "Error is null" or "Value is not
null": `default(T)` is `0` for an int, so the value alone cannot distinguish a
failure from a genuine zero. Decide for yourself whether you would rather model
this as a discriminated pair of types - C# is getting closer to making that
pleasant, and until then this shape is the usual compromise.
