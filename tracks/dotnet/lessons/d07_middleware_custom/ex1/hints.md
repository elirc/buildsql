## Hint 1

Three things in one method, and the last one is the easiest to forget: call
`next`. A middleware that does its work and returns has short-circuited the
request, which is not what this one is for.

The header goes on `context.Response.Headers`; the fact for the handler goes
somewhere that lives exactly as long as this request.

## Hint 2

```csharp
context.Response.Headers[HeaderName] = "yes";

if (context.Request.Query.ContainsKey("trace"))
{
    context.Items[ItemKey] = true;
}

return next(context);
```

`HttpContext.Items` is a per-request dictionary — the normal way one middleware
tells a handler something. A static field would work for one request and break
the moment two arrive at once.

Setting the header before `next` is deliberate: after the handler has written a
body, the headers have already gone out.
