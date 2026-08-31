## Hint 1

Three `List` members do all the work: `IndexOf` (answers -1 on a miss),
`RemoveAt`, and `Insert`. `MoveToTop` is remove-then-insert-at-0; `AddAfter`
is insert at anchor's index + 1 - but only when the anchor was actually found.

## Hint 2

```csharp
int index = items.IndexOf(anchor);
if (index < 0) { items.Add(item); } else { items.Insert(index + 1, item); }
```

For `Swap`, save one value in a local before overwriting (or use tuple
assignment: `(items[i], items[j]) = (items[j], items[i]);`). Do not guard the
indexes yourself - the indexer already throws the right exception.
