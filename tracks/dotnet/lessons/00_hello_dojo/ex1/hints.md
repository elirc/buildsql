## Hint 1

The route is already mapped for you; the only thing missing is what `Ping`
gives back. Two decisions are hiding in one line: which status code, and which
value gets serialised into the body.

The file already declares the record you need. Scroll to the bottom of
`Ex1.cs`.

## Hint 2

Replace the `throw` with a `return` of a result object. The helper for "200 and
here is the JSON" is `TypedResults.Ok(value)`, and `value` is a
`new PingResponse(...)` built from the two strings the gate is looking for.

Because the body is a single expression, you can keep the expression-bodied
form (`=>`) rather than adding braces.

## Hint 3

The shape is:

```csharp
private static IResult Ping() =>
    TypedResults.Ok(new PingResponse(/* status */, /* lesson */));
```

The two strings are exactly the ones in the README's JSON block, including the
underscores in the lesson slug. Do not convert anything to camelCase yourself —
the serialiser does that on the way out.
