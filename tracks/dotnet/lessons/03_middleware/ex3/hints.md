## Hint 1

Two paths through this method. One of them calls `next`; the other must not.

The constants you need are already on the class: `HeaderName` and `ValidKey`.
A request header is read with `context.Request.Headers[name]`, which gives you
a `StringValues` — `.FirstOrDefault()` turns it into a `string?` that is null
when the header is absent, which conveniently handles "missing" and "wrong" the
same way.

## Hint 2

On the rejection path you need to do exactly two things: set
`context.Response.StatusCode` to 401, and return *without* calling `next`.
`StatusCodes.Status401Unauthorized` is the named constant.

Returning from a non-async method that promises a `Task` means returning
`Task.CompletedTask`.

Do not write a body. The gate checks that the 401 has an empty one.

## Hint 3

```csharp
public Task InvokeAsync(HttpContext context)
{
    if (context.Request.Headers[HeaderName].FirstOrDefault() != ValidKey)
    {
        context.Response.StatusCode = /* … */;
        return Task.CompletedTask;
    }

    return next(context);
}
```

If the gate says `X-Reached-Handler` was present on your 401, the `return` is
missing and control fell through to the `next` call underneath.
