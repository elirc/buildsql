## Hint 1

`IComparable<T>` puts the ordering *inside* the type - one natural order, and
only one. `IComparer<T>` puts it in a separate object, so a type can be sorted
several ways and `Track` needs no ordering code at all.

`Compare(x, y)` returns negative when x comes first, 0 when they tie, positive
when y comes first. The actual numbers do not matter.

## Hint 2

Delegate to comparisons that already exist rather than subtracting:

```csharp
int byLength = x.Seconds.CompareTo(y.Seconds);
return byLength != 0 ? byLength : string.CompareOrdinal(x.Title, y.Title);
```

`a.Seconds - b.Seconds` looks equivalent and overflows for large values -
`CompareTo` never does.

The tie-break is not decoration: without it, two tracks of the same length come
back in whatever order the sort happened to produce, and `List<T>.Sort` is
*unstable*, so that order can change between runs. Any comparer used for
display needs a total order.

`Ordered` must not sort the caller's list. `new List<Track>(tracks)` copies,
then `copy.Sort(comparer)`.

Left to you: how the comparers handle nulls. The framework may pass them; a
comparer that throws on null is a comparer that crashes on real data.
