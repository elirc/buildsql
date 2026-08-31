## Hint 1

PUT replaces, so the end state is exactly the names in the body — which means
clearing what is there and adding what was asked for.

You cannot clear a collection you did not load. And you must not clear anything
until you know every name is real.

## Hint 2

```csharp
var book = await db.Books
    .Include(b => b.Genres)
    .FirstOrDefaultAsync(b => b.Id == id);
```

The `Include` is not optional: `Clear()` on an unloaded collection removes
nothing at all, silently.

Then look the names up in one query, `db.Genres.Where(g => wanted.Contains(g.Name))`,
and compare counts (or find the first name that came back with no match) to
produce the 400.

Only after that:

```csharp
book.Genres.Clear();
book.Genres.AddRange(genres);
await db.SaveChangesAsync();
```

EF works out which join rows to insert and which to delete.

## Hint 3

Two decisions worth being able to defend.

**Validate before clearing.** The gate re-reads the genres after a rejected
request precisely to catch "clear, then discover steampunk is not a genre" —
which leaves the book with nothing and the caller with a 400.

**Refuse to invent a genre.** Creating one on the fly makes every typo a
permanent tag that nothing else uses, which is how free-text tagging systems rot.
A 400 quoting the name is friendlier than it looks.

Left for you: how you detect the unknown name, and whether duplicates in the
request body should be an error or ignored. (The gate does not test it; decide
anyway.)
