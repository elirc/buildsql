## Hint 1

Two overrides and a one-line count. You have done this before, in lesson 06 —
which is the point of a rapid-fire round. Try to write both from memory before
reading on.

The two rules to satisfy: equal coordinates are equal, and equal coordinates
hash the same.

## Hint 2

```csharp
public override bool Equals(object? obj)
{
    return obj is Coordinate other && other.X == X && other.Y == Y;
}

public override int GetHashCode() => HashCode.Combine(X, Y);
```

`DistinctCount` is `new HashSet<Coordinate>(points).Count`.

## Hint 3

Two traps the gate checks. `Equals` is handed anything at all — a string, a null
— so the type-testing pattern has to come first; it covers both cases in one
expression.

And the hash must distinguish `(5, 6)` from `(6, 5)`. `X ^ Y` and `X + Y` both
collide on those, which is legal but turns your `HashSet` into a linear scan.
`HashCode.Combine` mixes properly.

Left to you: this whole class is `record Coordinate(int X, int Y);` in one line.
Be able to say why you might still write it by hand — usually because the type
predates records, or because you need equality on only *some* of the members.
