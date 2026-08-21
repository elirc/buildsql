## Hint 1

Do the two middlewares first — both are the ex3 pattern with a different header
and a different status code — and get them compiling. Then spend your thinking
on `Configure`.

For the order, start from the requirement that is hardest to satisfy: the 401
must still carry a correlation id. Only one arrangement makes that true.

## Hint 2

If the correlation middleware runs *after* the key check, a rejected request
never reaches it, so no header. Therefore correlation goes first.

The admin check must not apply to every path — `/l03/challenge/reports` with a
valid key has to be a 200 — so it belongs inside a `UseWhen` whose predicate
matches `/l03/challenge/admin`.

That leaves the key check, which must apply everywhere, and must be inside
correlation.

## Hint 3

```csharp
pipeline.UseMiddleware<CorrelationIdMiddleware>();
pipeline.UseMiddleware</* the one that answers 401 */>();
pipeline.UseWhen(
    context => context.Request.Path.StartsWithSegments("/l03/challenge/admin"),
    admin => admin.UseMiddleware</* the one that answers 403 */>());
```

Both of your middlewares follow ex3's shape exactly: compare a request header,
and on failure set `context.Response.StatusCode` and return
`Task.CompletedTask` without calling `next`. The 403 constant is
`StatusCodes.Status403Forbidden`.
