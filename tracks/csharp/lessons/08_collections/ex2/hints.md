## Hint 1

A `HashSet<T>` answers one question extremely fast: have I seen this before? It
does not remember order, which is why `DistinctInOrder` needs both a set and a
list — the set decides, the list remembers.

`SharedCount` is set arithmetic: build one set, then keep only what is also in
the other sequence.

## Hint 2

`HashSet<T>.Add` returns a `bool`: true if the item was new, false if it was
already there. That single return value collapses the whole "check then add"
dance into one line:

```csharp
if (seen.Add(item))
{
    result.Add(item);
}
```

For the second method, `new HashSet<string>(left)` builds a set from a sequence
(dropping duplicates on the way), and `IntersectWith(right)` removes everything
not in the other side, in place.

## Hint 3

The reason a `HashSet` is the right tool rather than
`if (!result.Contains(item))` on the list: `List<T>.Contains` walks the whole
list every time, so deduplicating n items costs n² comparisons.
`HashSet<T>.Contains` hashes and looks in one bucket — constant time on average.
For 10 items nobody notices; for 100,000 it is the difference between instant
and a coffee break.

That performance claim rests on `GetHashCode` being well distributed, which is
lesson 06 ex4 coming back around: give a `HashSet` a key type whose hash code
is a constant and it degrades to exactly the list you were avoiding.

Left to you: whether `SharedCount` should build its set from the left or the
right sequence. Think about which one you would rather be the smaller.
