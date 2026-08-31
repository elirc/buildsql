## Hint 1

`HashSet<string>.Add` does the membership test and the insert in one call:
it returns `false` when the item was already there. That false IS the "seen
a second time" signal - no `Contains`, no dictionary of counts.

## Hint 2

```csharp
HashSet<string> seen = new HashSet<string>();
foreach (string id in ids)
{
    if (!seen.Add(id)) { return id; }
}
return null;
```

`CountUnique` is even shorter: construct the set straight from the sequence
and return its `Count`.
