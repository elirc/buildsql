## Hint 1

Nothing here is new. It is ex3's `IMiddleware` with a scoped dependency, ex5's
request buffering, ex4's short-circuit and ex6's response capture, in one
method — plus the registration ex3 taught you.

The exercise is the *order of the steps inside the method*.

## Hint 2

Work through what each requirement forces:

1. `X-Record-Id` must be on **every** response, including the 413 — so write it
   first, before any branch.
2. The decision depends on the request's length — so buffer and read before
   deciding.
3. The refusal must set its own `X-Record` and write its body, then `return`.
4. Only then swap `Response.Body`, call `next`, read the capture, restore, set
   `X-Record`, and write the captured body on.

And in `Ex8Services`: `services.AddScoped<RecordMiddleware>();`

## Hint 3

The two lengths:

```csharp
context.Response.Headers[RecordHeader] = $"{request.Length}:{response.Length}";
```

…and on the refusal path the response is the literal `too large`, which is nine
characters — so `25:9`.

Remember `context.Request.Body.Position = 0;` after reading, or the handler's
echo comes back empty; and the `finally` that restores `context.Response.Body`,
or a throwing handler leaves a dead stream behind.

Left for you: assembling it, and checking the `X-Record-Id` behaviour. Two
requests with the same id means the middleware was registered as a singleton and
the "scoped" recorder inside it has been captive since startup — which is the
bug `IMiddleware` exists to prevent.
