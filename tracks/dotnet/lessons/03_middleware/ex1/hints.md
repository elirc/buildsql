## Hint 1

Two statements, and the order between them is the lesson. One of them puts a
header on the response; the other lets the rest of the pipeline run.

Ask yourself which one has to happen first, and what would be true of the
response if you did them the other way round.

## Hint 2

`context.Response.Headers["Name"] = "value"` sets a response header. It only
works while the response has not started — and the terminal handler starts it
by writing a body — so this line goes *before* you hand control on.

Handing control on means calling the `next` delegate with the context. The
method returns a `Task`; you can `return next(context);` without making the
method `async` at all.

## Hint 3

```csharp
public Task InvokeAsync(HttpContext context)
{
    context.Response.Headers[/* … */] = /* … */;
    return next(context);
}
```

The header name and value are both in the README and in the gate's message.
If the body comes back empty, you dropped the `next` call.
