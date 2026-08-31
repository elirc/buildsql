## Hint 1

One `try`, one `catch (InvalidOperationException)`, one `finally`. Both the
try and the catch `return`, and the finally still runs after either of them -
that is what makes it the right place for the cleanup line.

Do not catch `Exception`. The gate throws a `FormatException` at you on
purpose.

## Hint 2

```csharp
try
{
    action();
    log.Add("done");
    return "ok";
}
catch (InvalidOperationException ex)
{
    log.Add("caught");
    return $"caught:{ex.Message}";
}
finally
{
    log.Add("cleanup");
}
```

The third case is the one worth pausing on: when the action throws something
this method does not catch, the exception carries on to the caller and the
`finally` still runs on the way past. Cleanup at the end of the `try` would be
skipped; cleanup in the `catch` would be skipped on success. Only `finally`
covers all three.
