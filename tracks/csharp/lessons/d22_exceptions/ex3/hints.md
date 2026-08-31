## Hint 1

A `catch` can take a condition:

```csharp
catch (HttpLikeException ex) when (SomeTest(ex))
```

When the condition is false the catch does not run at all and the exception
carries on - which is not the same as catching it and rethrowing.

The logging has to happen inside the condition, so write the condition as a
method call.

## Hint 2

```csharp
private static bool Retryable(HttpLikeException exception, List<string> log)
{
    log.Add($"filter:{exception.Status}");
    return exception.Status >= 500;
}
```

The gate's last check is the reason filters exist. A filter is evaluated
*before* the stack unwinds, so its log line appears before the callee's
`finally` runs. A `catch` that inspects and rethrows would have unwound first,
and the order would be the other way round - and a debugger breaking on the
exception would have lost the original frames.

Note also what happens when the filter says no: same exception object, same
type, same stack trace, still in flight. Nothing you can write with catch and
`throw;` is quite that clean.
