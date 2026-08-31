## Hint 1

The join table is in the database and not in your model, so you walk it with the
skip navigation — `b.Genres` from one side, `g.Books` from the other. The
operator that flattens a collection navigation into rows is `SelectMany`.

Both endpoints need an existence check that is separate from the result.

## Hint 2

```csharp
await db.Books
    .Where(b => b.Id == id)
    .SelectMany(b => b.Genres)
    .Select(g => g.Name)
    .OrderBy(n => n)
    .ToListAsync();
```

…and the mirror image from `db.Genres`.

The existence check has to come first, because an empty list means two different
things: "this book has no genres" (a 200) and "there is no such book" (a 404).
`await db.Books.AnyAsync(b => b.Id == id)` separates them, and `AnyAsync`
translates to `EXISTS` rather than fetching a row.
