## Hint 1

Nothing here is new — it is ex2's nesting, ex3's parameterised prefix and ex4's
guard in one method. Build it outside in: the version group, its filter, the
kitchen group inside it, its filter, then the two endpoints.

The last check in the gate is about what does *not* happen when the outer filter
refuses.

## Hint 2

```csharp
var api = app.MapGroup("/d02/v1");
api.AddEndpointFilter(async (context, next) => { … });

var kitchens = api.MapGroup("/kitchens/{kitchen}");
kitchens.AddEndpointFilter(async (context, next) => { … });
```

The version filter compares
`context.HttpContext.Request.Headers["X-Api-Version"]` to `"1"` and returns
`TypedResults.BadRequest(…)` when it does not match.

The kitchen filter cannot use `GetArgument`, because it needs a value the
*group* supplied: read
`context.HttpContext.Request.RouteValues["kitchen"]?.ToString()`. Set the
`X-Kitchen-Checked` header before you decide, so the gate can see it ran.

## Hint 3

Both handlers start from the same lookup:

```csharp
string[] courses = Cookbook.Kitchens[kitchen];
```

The indexer is safe because the filter has already rejected every kitchen that
is not a key — that is what a guard buys you, and it is why the handlers can be
this short.

For the single recipe, put both conditions in one predicate
(`r.Id == id && courses.Contains(r.Course)`), so a recipe this kitchen does not
serve is indistinguishable from one that does not exist.

Left for you: the response shape for the single recipe, and which of the two
filters owns which failure.
