## Hint 1

You cannot remove from a dictionary while foreach-ing that same dictionary -
the enumerator notices the mutation and throws InvalidOperationException. The
standard fix: build a LIST of the keys to remove first (the snapshot ends the
enumeration), then loop over that list removing by key. For the `List<int>`
half, one built-in method does removal, order preservation, and the count.

## Hint 2

```csharp
List<string> doomed = readings.Where(p => p.Value < minimum).Select(p => p.Key).ToList();
foreach (string key in doomed) { readings.Remove(key); }
return doomed.Count;
```

`DropWhere` is `values.RemoveAll(v => condemned(v))` - RemoveAll takes a
`Predicate<int>`, so wrap the `Func` in a lambda and return its answer.
