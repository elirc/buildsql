## Hint 1

`Message?.Invoke(text)` is a single call that walks the handler list inside the
runtime, so you cannot get between the handlers. To put a `try` around each one
you have to do the walking yourself.

`Delegate.GetInvocationList()` gives you the handlers as an array.

## Hint 2

```csharp
Action<string>? handlers = Message;
if (handlers is null) { return failures; }

foreach (Delegate entry in handlers.GetInvocationList())
{
    try { ((Action<string>)entry)(text); }
    catch (Exception ex) { failures.Add(ex); }
}
```

Two details worth stopping on. First, the null check comes before
`GetInvocationList` - calling it on a null delegate is a
`NullReferenceException`, and the whole point of this exercise is not throwing
at the publisher.

Second, store the caught exception object itself. Wrapping it in a new
exception, or rethrowing with `throw ex`, resets the stack trace to this line
and the subscriber's bug becomes untraceable. Decide for yourself whether a
real publisher should return these or bundle them into an `AggregateException`.
