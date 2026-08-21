## Hint 1

Two handlers, six answers, no logic. Write the create as three guards in the
right order and the delete as a single conditional.

The order of the create's guards matters: a blank value is wrong whatever is in
the store, so it is checked first.

## Hint 2

Create: `string.IsNullOrWhiteSpace` → `TypedResults.BadRequest()`;
`store.Exists(value)` → `TypedResults.Conflict()`; otherwise `store.Add(value)`
and `TypedResults.Created($"/i3/codes/{code.Id}", code)`.

Delete: `store.Remove(id)` returns a `bool` — true is
`TypedResults.NoContent()`, false is `TypedResults.NotFound()`.

## Hint 3

```csharp
private static IResult DeleteCode(int id, ICodeStore store) =>
    store.Remove(id) ? TypedResults.NoContent() : TypedResults.NotFound();
```

Be able to say, out loud, why the duplicate is 409 and the blank is 400: one
depends on the current state of the collection and the other does not.
