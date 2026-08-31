## Hint 1

This is ex1 with one more level. A projection may contain a collection, and that
collection's projection may contain another one — EF handles the whole shape in
a single query.

Sort at every level, and start from the authors so the empty shelf survives.

## Hint 2

```csharp
await db.Authors
    .OrderBy(a => a.Name)
    .Select(a => new ShelfAuthor(
        a.Name,
        a.Books
            .OrderBy(b => b.Title)
            .Select(b => new ShelfBook(
                b.Title,
                b.Genres.OrderBy(g => g.Name).Select(g => g.Name).ToList()))
            .ToList()))
    .ToListAsync();
```

Three `OrderBy`s, three levels, one `ToListAsync`.

The alternative — fetch authors, loop, fetch books, loop, fetch genres — is the
N+1 squared, and it reads perfectly well right up until the data is real.

## Hint 3

Worth understanding rather than just copying: EF sends the JOINed rows and
reassembles the object graph on the way back, which is why one query can produce
a nested shape at all.

The cost is the flip side of d11 ex7. JOINing collections repeats the parent's
columns once per child row, so a wide projection can move a surprising amount of
data even in a single round trip. One query is usually right; `AsSplitQuery` is
the escape hatch when the multiplication gets out of hand.

Left for you: the three sorts, and checking that Linus still appears.
