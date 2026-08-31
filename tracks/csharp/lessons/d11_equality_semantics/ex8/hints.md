## Hint 1

Equality has to be **symmetric**: if `a.Equals(b)` is true then `b.Equals(a)`
must be too. Inheritance is where that breaks, and it breaks in a very specific
way.

Write `Point2.Equals` with `obj is Point2` and see what happens: a `Point2` at
(1,2) considers a red `ColouredPoint` at (1,2) equal, while the coloured point
does not agree. Then fix it.

## Hint 2

The fix is to compare the runtime types exactly:

```csharp
public override bool Equals(object? obj)
{
    if (obj is null || GetType() != obj.GetType()) return false;
    Point2 other = (Point2)obj;
    return X == other.X && Y == other.Y;
}
```

`GetType() != obj.GetType()` is what makes a base instance and a derived one
never equal, in either direction - so symmetry holds however the comparison is
written.

`ColouredPoint.Equals` can then lean on it:

```csharp
public override bool Equals(object? obj) =>
    base.Equals(obj) && Colour == ((ColouredPoint)obj!).Colour;
```

because `base.Equals` has already established that the runtime types match.

Hash codes must follow: `HashCode.Combine(base.GetHashCode(), Colour)`.

Left to you: `GetType()` equality also means a proxy or a subclass added for
testing is never equal to the thing it stands for. That is a real cost, and it
is a large part of why `record` picks the same rule and why value types are
usually `sealed`.
