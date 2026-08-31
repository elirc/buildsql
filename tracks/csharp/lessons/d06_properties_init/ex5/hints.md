## Hint 1

Two properties, two policies. `Total` recomputes every time and is always
right. `CachedTotal` remembers, and therefore has to be *invalidated* when the
data changes.

A `decimal?` field makes "no cached value yet" representable without needing a
separate bool, and setting it back to `null` is how `Add` invalidates.

## Hint 2

The counter has to be incremented on the path that actually does the addition,
which needs a statement body rather than `??=`:

```csharp
get
{
    if (_cachedTotal is null)
    {
        TotalComputations++;
        _cachedTotal = _prices.Sum();
    }

    return _cachedTotal.Value;
}
```

(`_cachedTotal ??= _prices.Sum()` is the idiomatic one-liner when you do not
need to count - worth knowing, and worth knowing why it does not fit here.)

`Add` is two lines, and the second one is the one people forget:

```csharp
_prices.Add(price);
_cachedTotal = null;
```

That is the whole lesson of caching: the easy half is remembering, the hard
half is knowing when to forget. Every stale-data bug you will ever debug is a
missing version of that second line.
