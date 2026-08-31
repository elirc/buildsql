## Hint 1

The gate counts SQL commands and wants exactly one. That rules out the obvious
approach — load the matching rows, change them, save — which is a `SELECT` plus
an `UPDATE`, and gets worse the more rows match.

EF Core has a method that sends the `UPDATE … WHERE` and never materialises an
entity.

## Hint 2

```csharp
int changed = await db.Members
    .Where(m => m.Grade == from)
    .ExecuteUpdateAsync(setters => setters.SetProperty(m => m.Grade, to));
```

It returns the number of rows affected, which is exactly what the response
needs, and `SaveChangesAsync` is not involved at all.

The trade is worth knowing: nothing is tracked, so entities already loaded in
this context keep their stale values — and there are no `SaveChanges`
interceptors, so audit columns and domain events do not fire.

Validate both query parameters first: a regrade with no target is a 400, not a
silent no-op.
