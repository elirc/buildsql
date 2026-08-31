## Hint 1

One line of logic: did the store actually remove something? That question has a
boolean answer, and the two status codes follow from it directly.

Resist adding a body to the success case.

## Hint 2

`store.Remove(id)` returns `true` when a booking was there and `false` when it
was not, so:

```csharp
return store.Remove(id) ? TypedResults.NoContent() : TypedResults.NotFound();
```

`TypedResults.NoContent()` writes a 204 and no body. `TypedResults.Ok()` would
be a 200 with an empty body, which is a different — and less precise — claim.
