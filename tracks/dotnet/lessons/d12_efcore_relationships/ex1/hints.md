## Hint 1

A navigation property is not loaded unless you ask. A plain `FirstOrDefaultAsync`
gives you the author with an *empty* Books list — no error, no warning, and a
response that looks like the author wrote nothing.

Two ways to ask; the one that fetches least is a projection.

## Hint 2

```csharp
await db.Authors
    .Where(a => a.Id == id)
    .Select(a => new AuthorDetail(
        a.Id,
        a.Name,
        a.Books.OrderBy(b => b.Title).Select(b => new BookSummary(b.Id, b.Title)).ToList()))
    .FirstOrDefaultAsync();
```

The inner `Select` becomes part of the SQL, so you get two columns per book and
nothing is tracked.

`Include(a => a.Books)` is the other route, and the one to use when you need the
book entities themselves — to change them, or because you are about to save.

Null from `FirstOrDefaultAsync` is your 404; an empty Books list is not.
