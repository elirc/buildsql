## Hint 1

`Add` does three things and the order is the exercise: validate, store, raise.
A refused add must not appear in the list *or* on the event.

Both query methods are `GroupBy` over the stored items.

## Hint 2

```csharp
if (string.IsNullOrEmpty(item)) { throw new ArgumentException(...); }
_items.Add(item);
Added?.Invoke(item);
```

Raising after the change is what lets a handler read `Count` and see the state
the event is telling it about. Raising before it would announce something that
had not happened yet.

`Duplicates` is `GroupBy(item => item)`, `Where(g => g.Count() > 1)`, then the
keys - and the keys come out in first-seen order for free.

`Tally` is the same grouping ordered by `group.Count()` descending with a
`ThenBy` on the key. The tie-break is not optional: without it, two items with
the same count come out in whatever order the grouping happened to produce.
