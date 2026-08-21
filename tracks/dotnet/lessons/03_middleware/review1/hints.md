## Hint 1

Two things to decide. What does the recorder do — and there is only one moment
in a middleware at which the final status code is knowable. And where does it
sit relative to a middleware that sometimes refuses to call `next`.

Play the second one out: if the recorder is downstream of the teapot, what runs
when the teapot short-circuits?

## Hint 2

`context.Response.StatusCode` is only final after the rest of the pipeline has
finished, so the recorder awaits `next` first and records afterwards. That
makes it a genuinely `async` method.

`IStatusLog` is a singleton and arrives as a second parameter of `InvokeAsync`,
resolved per request — it must not be a constructor parameter.

For the order: the observer has to be outside the thing it observes.

## Hint 3

```csharp
public async Task InvokeAsync(HttpContext context, IStatusLog log)
{
    await next(context);
    log.Record(/* … */);
}
```

and in `Configure`, the two `UseMiddleware` lines swap places. If the gate says
the recorder never saw the 418, you left the teapot on the outside.
