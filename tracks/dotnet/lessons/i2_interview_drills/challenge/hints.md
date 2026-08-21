## Hint 1

Do the authorization first, before either handler works — it is one line and it
is the thing the whole exercise is marked on.

A `MapGroup` can carry the requirement for both endpoints at once, which also
means the *next* endpoint someone adds under that prefix is protected by
default.

Then treat `ListNotes` as drill 1 with a filter that comes from the token, and
`CreateNote` as an ordinary validated create.

## Hint 2

```csharp
var notes = app.MapGroup("/i2/challenge/notes")
    .RequireAuthorization(policy => policy
        .AddAuthenticationSchemes(I2Jwt.Scheme)
        .RequireAuthenticatedUser());

notes.MapGet("", ListNotes);
notes.MapPost("", CreateNote);
```

In `ListNotes`: resolve `page ?? 1` and `size ?? 2`, validate into an errors
dictionary keyed `"page"` and `"size"`, then filter `store.All()` by
`user.Identity?.Name` — **before** you count or page, because the total is this
caller's total.

In `CreateNote`: validate `text`, then `store.Add(owner, text)` with the owner
taken from the token, then 201 with a `Location`.

## Hint 3

```csharp
string owner = user.Identity?.Name ?? "";
var mine = store.All().Where(n => n.Owner == owner).OrderBy(n => n.Id).ToList();

response.Headers["X-Total-Count"] = mine.Count.ToString();
return TypedResults.Ok(mine.Skip((wanted - 1) * perPage).Take(perPage).ToList());
```

Two things a reviewer looks for and the gate checks: the filter comes from the
token rather than from a query parameter, and the total is `mine.Count` rather
than `store.All().Count` — reporting the global total leaks how much data other
people have.
