## Hint 1

Write the checks in the order the README lists them: payload, existence,
permission, then the work. Each one has exactly one early return.

The 401 needs no code at all — `.RequireAuthorization()` on the route already
handles it.

## Hint 2

Validation first, and its 400 is the same `ValidationProblem` you wrote in ex4.

Then `store.Find(id)`; null is a 404.

Then permission: the caller may proceed if they own the note **or** they are in
the `admin` role. `user.IsInRole("admin")` works because ex1 set
`RoleClaimType = "role"`.

And when they may not proceed, the answer is `TypedResults.NotFound()` — the same
result as "no such note", on purpose.

## Hint 3

```csharp
var note = store.Find(id);
if (note is null) { return TypedResults.NotFound(); }

string caller = user.Identity?.Name ?? "";
bool allowed = note.Owner == caller || user.IsInRole("admin");
if (!allowed)
{
    // Not 403: telling this caller the note exists is itself a leak.
    return TypedResults.NotFound();
}

store.Replace(id, request.Text);
return TypedResults.NoContent();
```

Before you move on, be able to say out loud when 403 would have been the better
answer — `reading.md` has the test, and it is a standard interview follow-up.
