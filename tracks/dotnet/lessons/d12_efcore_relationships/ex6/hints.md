## Hint 1

Start from the authors, not the reviews — that is what keeps the author who has
written nothing in the result. Then reach two hops down inside the projection.

One of the three authors has no reviews at all, and averaging nothing throws.

## Hint 2

```csharp
await db.Authors
    .OrderBy(a => a.Name)
    .Select(a => new AuthorRating(
        a.Name,
        a.Books.Count,
        (int)(a.Books.SelectMany(b => b.Reviews).Average(r => (double?)r.Stars) ?? 0)))
    .ToListAsync();
```

`SelectMany` flattens the second hop, and the `(double?)` cast is the same trick
as d11 ex4: it lets the database's `NULL` come back as `null` instead of raising
`InvalidOperationException`.

The cast to `int` truncates, which is why Grace's 3.67 is a 3.

## Hint 3

The design point worth taking away is the direction. Starting from `Reviews` and
grouping by author would give the same numbers for Ada and Grace and would
silently **drop Linus** — an inner join, with no error and no obvious symptom.

"The customer who has never ordered" is the same bug, and it is the one that
makes a monthly report quietly under-count.

Left for you: assembling the projection, and predicting the command count before
you run it. (One.)
