## Hint 1

Two things, and the order they appear in the query is what matters. Sort while
it is still a database query, and cut the columns down before the rows come
back.

The gate reads the raw JSON, so "project after materialising" is visible.

## Hint 2

```csharp
await db.Members
    .OrderByDescending(m => m.Credits)
    .ThenBy(m => m.Name)
    .Select(m => new MemberSummary(m.Id, m.Name, m.Credits))
    .ToListAsync();
```

Everything before `ToListAsync` becomes SQL, so the `SELECT` really does name
three columns and the `ORDER BY` really is the database's.

Putting `ToListAsync()` first and `Select` after is a `SELECT *` plus an
in-memory transform: the same answer, every column fetched.
