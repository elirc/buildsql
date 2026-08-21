## Hint 1

You are writing one code path that behaves two different ways, and the only
difference is how the row was loaded. Everything after the load — assign the
name, save, report — is identical.

Do not add an `if` around the save. The whole point is that the same save
behaves differently depending on the query that came before it.

## Hint 2

Build the query first and branch on `tracked`:

```csharp
IQueryable<Product> query = tracked ? db.Products.AsQueryable() : db.Products.AsNoTracking();
```

Then `FirstOrDefaultAsync(p => p.Id == id)` on it, 404 on null, assign
`product.Name = name`, and capture what `await db.SaveChangesAsync()` returns —
it is an `int`, the number of rows written.

Note there is no `Update` call anywhere. For a tracked entity, assigning to the
property *is* the edit.

## Hint 3

```csharp
product.Name = name;
int changes = await db.SaveChangesAsync();
return TypedResults.Ok(new RenameResult(changes, product.Name));
```

`changes` will be 1 in the tracked case and 0 in the untracked one, and that
zero is the entire lesson: EF never saw the change, never wrote anything, and
never complained. Read `reading.md` on this one even if the gate goes green
first time.
