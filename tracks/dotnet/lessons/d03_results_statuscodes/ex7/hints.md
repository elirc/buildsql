## Hint 1

The signature is already written and it is the interesting part: three outcomes,
named in the return type. Your job is to return one of exactly those three — and
the compiler will not let you do anything else.

Order the checks so the cheapest, most obviously-wrong case goes first.

## Hint 2

`TypedResults.BadRequest("…")`, `TypedResults.NotFound()` and
`TypedResults.Ok(room)` each convert implicitly to the union type, so you can
return them directly with no cast.

That implicit conversion is why `TypedResults` matters here: `Results.Ok(room)`
returns a plain `IResult`, which does **not** convert, and the method will not
compile.

## Hint 3

```csharp
if (id > 100) { return TypedResults.BadRequest($"id {id} is out of range."); }

var room = store.FindRoom(id);
if (room is null) { return TypedResults.NotFound(); }

return TypedResults.Ok(room);
```

Worth trying once you have it passing: add a fourth outcome — say a
`TypedResults.Conflict()` — and watch the compiler reject it. That error is the
feature you are buying by writing the union out.

Still yours to decide: whether the 400 body should name the id, and what it
should say.
