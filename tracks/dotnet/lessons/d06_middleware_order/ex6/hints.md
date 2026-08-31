## Hint 1

Two obvious placements and both are wrong. Before `next`, nothing has happened
yet, so the value is empty. After `next`, the handler has already written the
body — the headers went out with it and are read-only.

You need to *register* the work early and *run* it late.

## Hint 2

`context.Response.OnStarting(callback)` registers a callback that fires at the
instant the response starts — the last moment the headers are still writable:

```csharp
context.Response.OnStarting(() =>
{
    context.Response.Headers[HeaderName] = D06Trace.Read(context);
    return Task.CompletedTask;
});

return next(context);
```

Check the expected value against your mental model: it is `work>,handler`, with
no `work<`. The callback runs when the handler writes, which is before the
pipeline unwinds — a header can only ever describe what has already happened.
