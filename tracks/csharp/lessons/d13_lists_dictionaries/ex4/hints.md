## Hint 1

Two tools, two contracts. `List.Sort(Comparison<Entry>)` rearranges the
caller's list in place. `OrderByDescending(...).ThenBy(...).ToList()` builds a
NEW list and leaves the source alone. The gate checks both directions - if
`Ranked` uses `Sort` on the input, the "original untouched" assert catches it.

## Hint 2

A `Comparison<Entry>` returns negative / zero / positive. Descending by score
means comparing the arguments in reverse order:

```csharp
entries.Sort((a, b) => a.Score != b.Score
    ? b.Score.CompareTo(a.Score)
    : string.CompareOrdinal(a.Player, b.Player));
```
