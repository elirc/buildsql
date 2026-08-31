## Hint 1

You do not need to load the author. A `Book` carries its parent's id as an
ordinary property, and setting it is all that attaches the new row.

You do still need to know the author *exists* — think about what happens if you
insert with an id nobody has.

## Hint 2

```csharp
if (!await db.Authors.AnyAsync(a => a.Id == id)) { return TypedResults.NotFound(); }

var book = new Book { Title = request.Title, Year = request.Year, AuthorId = id };
db.Books.Add(book);
await db.SaveChangesAsync();
```

Without the check, the insert fails on a foreign-key violation: a
`DbUpdateException` wrapping a provider message, which reaches the client as a
500 that explains nothing. One `AnyAsync` turns it into a 404 that does.

Validate the body before the existence check, and read `book.Id` after the save
for the Location.

The other route is `author.Books.Add(book)` on a loaded author — natural when
you already have the parent in hand, and one query more when you do not.
