## Hint 1

The header is already right, so the reading works. The problem is what is left
afterwards: a request body is a forward-only stream, and you just read it to the
end.

Two things are missing — one that makes the stream rewindable, and one that
rewinds it.

## Hint 2

```csharp
context.Request.EnableBuffering();

using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
string body = await reader.ReadToEndAsync();

context.Response.Headers[HeaderName] = body.Length.ToString();

context.Request.Body.Position = 0;

await next(context);
```

`EnableBuffering()` wraps the body in a seekable stream (spilling to disk past a
threshold), and `Position = 0` puts the next reader back at the start.

`leaveOpen: true` matters too: disposing the reader would close the request
stream out from under everyone downstream.

The cost is real — the body is now held rather than streamed — so do this only
in middleware that genuinely needs the body.
