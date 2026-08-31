## Hint 1

A group prefix is a route template, so it may contain a parameter. Put
`{course}` in the prefix and both endpoints below inherit it — including the one
mapped on the group root.

The handlers already declare a `string course` parameter. Nothing else is needed
to receive it.

## Hint 2

```csharp
var group = app.MapGroup("/d02/courses/{course}");
group.MapGet("", Titles);
group.MapGet("/longest", Longest);
```

Both handlers filter `Cookbook.Recipes` on the course first. An empty result is
not an empty course — it means no such course — so both return
`TypedResults.NotFound()` in that case.

"Longest" is by `Minutes`: `OrderByDescending(r => r.Minutes).FirstOrDefault()`.
