## Hint 1

One query, and the only interesting decision is *where* the projection goes. The
gate reads the raw response body, so the difference between projecting before
and after materialising is visible from outside.

## Hint 2

```csharp
await db.Courses
    .OrderBy(c => c.Title)
    .Select(c => new CourseSummary(c.Id, c.Title, c.Credits))
    .ToListAsync();
```

Because the `Select` is before `ToListAsync`, the SQL names three columns and
`Subject` is never fetched. Nothing is tracked either — there is no entity to
track — which is a small extra saving on every read-only query.

`ToListAsync()` followed by `.Select(...)` gives the same JSON and a `SELECT *`.
