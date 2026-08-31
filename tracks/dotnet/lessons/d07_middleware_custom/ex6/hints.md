## Hint 1

You cannot change bytes that have already gone to the client. So do not let them
go: give the rest of the pipeline a stream of *yours* to write into, and decide
what the real client sees afterwards.

`context.Response.Body` is a settable property.

## Hint 2

Swap it before `next`, read it after, restore it, then write:

```csharp
var real = context.Response.Body;
using var buffer = new MemoryStream();
context.Response.Body = buffer;

await next(context);

buffer.Position = 0;
string written = await new StreamReader(buffer).ReadToEndAsync();

context.Response.Body = real;
context.Response.Headers[HeaderName] = written.Length.ToString();
await context.Response.WriteAsync(written.ToUpperInvariant());
```

The rewind before reading is ex5's rule again.

## Hint 3

Wrap it in `try`/`finally` and restore `context.Response.Body = real;` in the
`finally`. If the handler throws, leaving a dead `MemoryStream` on the context
breaks every middleware above you — including the one whose job is to turn that
exception into a response.

Notice why the header assignment is legal here at all: nothing has been written
to the *real* response yet, so its headers are still open. Capturing the response
is what buys you the right to change your mind.

Left for you: assembling it, and noticing what this costs. The whole response is
now in memory and streaming is gone — which is why an endpoint filter that
transforms the result object (d02 ex7) is the better tool whenever it applies.
