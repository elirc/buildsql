## Hint 1

Two paths, and you have written both before. The hit is ex4's short-circuit:
write something and return, without calling `next`. The miss is ex6's capture:
hold the pen, let the pipeline write, then keep a copy.

The key is `context.Request.Path`.

## Hint 2

```csharp
if (cache.TryGet(key, out string cached))
{
    context.Response.Headers[HeaderName] = "HIT";
    await context.Response.WriteAsync(cached);
    return;                       // no next - that is the whole point
}
```

The miss path is ex6's swap, plus a `cache.Set(key, written)` before you write
the captured body on to the real response.

Set `X-Cache` before writing in both branches: once a byte of body has gone, the
headers have gone with it.

## Hint 3

Restore `context.Response.Body` in a `finally`, exactly as in ex6.

Then read the gate: the handler's answer changes every time it runs, so `made 2`
coming back from a supposed hit means the handler ran again and nothing was
saved. A cache that still does the work is not a cache.

Worth thinking about before you move on — none of this is required to pass, and
all of it is required in production. Keying on the path alone ignores the query
string, the `Accept` headers and *who is asking*, and that last one turns a
cache into a data leak. Nothing here ever expires. Nothing coordinates two
instances behind a load balancer. `builder.Services.AddOutputCache()` handles
all three, and knowing that is half of the interview answer.
