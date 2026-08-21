## Hint 1

`store.All()` gives you every note in the system. Your job is the `Where`.

The only question is where the value you filter on comes from — and there is
exactly one source in this method that a caller cannot forge.

## Hint 2

`user.Identity?.Name` is the `sub` claim from the validated token. That is the
owner to compare against.

It is *not* a query parameter, a header, or a field in a body, because all three
are written by the caller. A filter the client controls is not a filter.

Then `OrderBy(n => n.Id)`, `ToList()`, and `TypedResults.Ok(...)`.

## Hint 3

```csharp
string owner = user.Identity?.Name ?? "";

var mine = store.All()
    .Where(n => n.Owner == owner)
    .OrderBy(n => n.Id)
    .ToList();

return TypedResults.Ok(mine);
```

A caller with no notes ends up with an empty list, which is correct: they exist
and own nothing. Do not turn that into a 404.
