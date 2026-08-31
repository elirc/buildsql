## Hint 1

`app.MapGroup(prefix)` hands you back something you map on instead of `app`.
Everything you map on it starts with the prefix — which means the prefix belongs
in exactly one place, and the endpoints must not repeat it.

Two endpoints: the list, and one recipe.

## Hint 2

The group root is the **empty string**, not `"/"` and not the prefix again:

```csharp
var group = app.MapGroup("/d02/recipes");
group.MapGet("", List);
group.MapGet("/{id:int}", GetRecipe);
```

The handlers are ordinary: sort the titles with `StringComparer.Ordinal`, and
let `FirstOrDefault` plus a null check pick between `Ok` and `NotFound`.
