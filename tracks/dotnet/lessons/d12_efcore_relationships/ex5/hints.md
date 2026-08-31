## Hint 1

The gate counts one SQL command and checks that the reviews below the threshold
never appear. Both mean the filter has to be *inside* the query, not applied to a
loaded list.

You can filter a collection while projecting it — the same shape as ex1, with a
`Where` in the middle.

## Hint 2

```csharp
int floor = minStars ?? 0;

await db.Books
    .Where(b => b.Id == id)
    .Select(b => new BookReviews(
        b.Title,
        b.Reviews
            .Where(r => r.Stars >= floor)
            .OrderBy(r => r.Reviewer)
            .Select(r => new ReviewLine(r.Reviewer, r.Stars))
            .ToList()))
    .FirstOrDefaultAsync();
```

`Include(b => b.Reviews.Where(...))` — a filtered include — does the same job
when you want the entities rather than a DTO.

A book whose reviews all fall below the floor is still a 200 with an empty list;
only a missing book is a 404.
