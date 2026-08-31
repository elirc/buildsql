## Hint 1

A LINQ operator returns a new sequence rather than changing the old one, which
means you can build the query up a clause at a time:

```csharp
IEnumerable<Book> matches = books;
if (author is not null) { matches = matches.Where(...); }
```

Nothing has run yet at that point, so the branches cost nothing. A null
criterion means *skip that filter entirely* - not *match books whose author is
null*.

## Hint 2

Order after all the filters, then materialise **once**:

```csharp
List<Book> ordered = matches
    .OrderBy(book => book.Year)
    .ThenBy(book => book.Title, StringComparer.Ordinal)
    .ToList();
```

Now the page is `ordered.Skip(...).Take(...)` and the total is `ordered.Count`.
Both come off the same list, which is what makes the gate's
enumerated-exactly-once assertion pass.

## Hint 3

The count is the part that is easy to get subtly wrong. `TotalMatches` is how
many books matched the criteria, **before** the paging - so it cannot be taken
after `Skip`/`Take`, where it would equal the page size on every full page and
the pager would have no idea how many pages exist.

The tempting alternative is `matches.Count()` and then a second query for the
page. It gives the right numbers for an array and it walks the source twice; if
the caller hands you a sequence that can only be read once - a file, a reader,
a generator - the second walk gets nothing. Deciding when that matters is worth
a minute of thought, and lesson d21 is entirely about it.
