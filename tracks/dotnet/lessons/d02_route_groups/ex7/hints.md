## Hint 1

This filter does nothing on the way in. Await `next`, look at what came back,
and decide whether to hand it on unchanged or replace it.

What comes back is the handler's return value as `object?` — for these three
endpoints that is either a `List<string>` or an `IResult`.

## Hint 2

```csharp
var result = await next(context);
return result is List<string> items ? … : result;
```

The pattern match is the exercise. Wrapping unconditionally would also wrap
`/health`, and in a real API it would wrap your 400s and 404s too — which is how
a client ends up parsing an error out of an envelope that promises a list.

Build the replacement with `TypedResults.Ok(new Envelope(items, items.Count))`,
and count *after* awaiting `next`, not before.
