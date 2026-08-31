## Hint 1

This one is shorter than it looks. Load the book, remove it, save — and say
nothing about the reviews at all.

If you find yourself deleting reviews by hand, stop and ask what EF already
knows about the relationship.

## Hint 2

```csharp
var book = await db.Books.FindAsync(id);
if (book is null) { return TypedResults.NotFound(); }

db.Books.Remove(book);
await db.SaveChangesAsync();
```

`Review.BookId` is a non-nullable `int`, so the relationship is **required**, and
a required relationship cascades on delete by convention. The reviews go, and so
do the book's rows in the join table.

Worth knowing before you rely on it: make that FK nullable and the convention
changes to `ClientSetNull` — the children survive with a null parent. And
`OnDelete(DeleteBehavior.Restrict)` is the third option, which is the right one
when "delete this and everything under it" should need saying twice.
