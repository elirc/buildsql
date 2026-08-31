## Hint 1

A `Dictionary<TKey, int>` holds the counts. The only hard part is `TopKeys`,
and specifically its tie-break: keys with the same count come back in the order
they were **first seen**, which a dictionary cannot tell you.

So record the order yourself as keys arrive.

## Hint 2

Keep a `List<TKey>` alongside the counts and append to it only the first time a
key appears. Then the ordering is:

```csharp
_order
    .OrderByDescending(key => _counts[key])
    .Take(count)
    .ToList();
```

`OrderByDescending` is a **stable** sort in LINQ - items that compare equal keep
their input order - so ordering the first-seen list gives you the tie-break for
free. That stability is a documented guarantee of LINQ's `OrderBy` family and
*not* of `List<T>.Sort` or `Array.Sort`, which is a difference worth
remembering.

`Take` handles a count larger than the number of keys without a guard, and a
count of 0 or less gives an empty list.

`where TKey : notnull` is required by the dictionary. Note that everything here
depends on `TKey` having sensible `Equals` and `GetHashCode` - which is d11's
lesson arriving as a precondition rather than as a topic.
