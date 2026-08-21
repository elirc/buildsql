## Hint 1

Three paths, and two of them end without calling `next`. Write them as three
early returns and the method stays four lines longer than it needs to be, which
is the right shape under time pressure.

`IRequestCounter.Increment(key)` gives you the running total for that key. You
do not have to write the counting.

## Hint 2

Read `X-Api-Key` with
`context.Request.Headers[HeaderName].FirstOrDefault() ?? ""`. An empty string
covers both "absent" and "empty", and both are the 400.

Then `counter.Increment(key)` — note that you increment *before* comparing, so
the fourth request for a key sees 4, which is greater than `Limit`.

`StatusCodes.Status429TooManyRequests` is the constant, and the `Retry-After`
header is a plain response header whose value is the string `"60"`.

## Hint 3

```csharp
if (counter.Increment(key) > Limit)
{
    context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
    context.Response.Headers["Retry-After"] = "60";
    return Task.CompletedTask;
}

return next(context);
```

If the gate says the body was not empty, the 429 path fell through into the
`next` call — the return is missing. And before you move on, be able to say what
is wrong with a fixed window: a client can spend its whole budget at the end of
one window and again at the start of the next.
