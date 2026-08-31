## Hint 1

`where T : IComparable<T>` buys you exactly one member: `CompareTo`. Everything
in this class is built from it.

`a.CompareTo(b)` is negative when a comes first, 0 when they are equivalent,
positive when b comes first. Write the three methods in terms of that and do
not reach for `<` or `>`, which are not available on an unconstrained `T`.

## Hint 2

```csharp
public bool Contains(T value) =>
    Low.CompareTo(value) <= 0 && High.CompareTo(value) >= 0;
```

Both bounds are inclusive, so both comparisons include the 0 case. Read that
line out loud - "Low is at or before value, and High is at or after it" - to
check the direction, because getting a `CompareTo` the wrong way round compiles
perfectly and inverts the answer.

`Clamp` returns `Low` when the value is below it, `High` when above, and the
value otherwise.

`Overlaps` is the one worth thinking about. The clean way is to ask when they
*do not* overlap - one ends entirely before the other begins - and negate:

```csharp
return Low.CompareTo(other.High) <= 0 && other.Low.CompareTo(High) <= 0;
```

Left to you: whether a range where `Low` equals `High` is legal. This one
allows it; a half-open range design usually would not, and the difference
matters as soon as you start joining ranges together.
