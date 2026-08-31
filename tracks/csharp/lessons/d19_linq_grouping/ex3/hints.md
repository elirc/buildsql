## Hint 1

There is a one-call operator for each of the first two methods, and choosing
between them is the exercise. One of them allows a key to appear many times;
the other insists it appears once.

`ToLookup` takes a key selector and, optionally, an element selector - the same
pair `ToDictionary` takes.

## Hint 2

```csharp
books.ToLookup(book => book.Author, book => book.Title);   // many values per key
books.ToDictionary(book => book.Id, book => book.Title);   // one value per key
```

Do **not** guard the second one against duplicates. The `ArgumentException`
`ToDictionary` throws is the answer: a duplicate id means the assumption behind
the index is false, and swallowing it - or keeping the last one - buries a bug
that will surface somewhere much less helpful.

`BookCountByAuthor` is the middle case: many rows per key, but one value out.
`GroupBy` then `ToDictionary` with `group.Count()`.

And notice the asymmetry the gate checks at the end: a missing key gives an
empty sequence from a lookup, and a `KeyNotFoundException` from a dictionary.
