## Hint 1

Two endpoints, and the interesting one is the list. There is no branch in it at
all: an optional filter narrows the set, and whatever is left is the answer —
including nothing.

The single-item endpoint is where the 404 lives.

## Hint 2

Start from `store.Bookings().AsEnumerable()` and add the filter only when
`state` has a value:

```csharp
if (!string.IsNullOrWhiteSpace(state)) { bookings = bookings.Where(...); }
```

Then `OrderBy(b => b.Id)` and `TypedResults.Ok(...)`. No `Count == 0` check
anywhere: an empty list is a perfectly good 200.

For the item, `store.Find(id)` gives null when there is none — and *that* is the
404.
