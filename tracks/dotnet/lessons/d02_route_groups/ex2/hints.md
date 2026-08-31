## Hint 1

`MapGroup` exists on a group as well as on the application, and calling it there
is what nests. Three prefixes have to end up joined: the admin one, the resource
one, and the endpoint's own template.

Two of the gate's checks are about what must *not* answer — read them before you
start.

## Hint 2

```csharp
var admin = app.MapGroup("/d02/admin");
var recipes = admin.MapGroup("/recipes");
```

`recipes` — not `app` — is what `/count` gets mapped on. Hanging the inner group
off `app` compiles perfectly and gives you `/d02/recipes/count`, which is the
404 the gate is looking for.

The courses group maps its endpoint on `""`, exactly as in ex1.
