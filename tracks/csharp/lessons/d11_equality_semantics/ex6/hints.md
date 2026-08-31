## Hint 1

`IEqualityComparer<T>` is the answer to "I need a different definition of equal
here, and either the type is not mine to change or it already has a natural
one".

Two methods, one contract: `Equals(x, y)` and `GetHashCode(obj)` must agree,
exactly as an overridden pair must - so derive both from the same value.

## Hint 2

A private helper that produces the comparison value keeps them honest:

```csharp
private static (int, int) Cell(Reading reading) =>
    ((int)Math.Floor(reading.Latitude), (int)Math.Floor(reading.Longitude));
```

Then `Equals` compares two cells and `GetHashCode` hashes one -
`HashCode.Combine(cell.Item1, cell.Item2)` or the tuple's own `GetHashCode`.

`Math.Floor` rather than a cast: casting truncates toward zero, so -1.2 becomes
-1 and lands in the same cell as -1.8 *and* as -0.4. Flooring gives -2, which
is the cell a map would draw.

The framework passes nulls while probing, so handle them: two nulls are equal,
one null is not, and neither may reach `Cell`.

`Distinct(comparer)` is the LINQ overload that takes it.
