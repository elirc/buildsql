## Hint 1

Two members. `ToString()` is one interpolated string. `CompareTo` is the
interesting one, and it has three parts to compare in priority order.

Think of it as a tie-break chain: compare the majors, and only if they are
equal look at the minors, and only if those are equal look at the patches. That
is the same "ORDER BY a, b, c" idea you know from SQL.

## Hint 2

`int` already implements `IComparable<int>`, so `Major.CompareTo(other.Major)`
gives you the negative/zero/positive answer for one part without writing any
subtraction. Comparing with `-` works for small ints and overflows for large
ones, which is why `CompareTo` is the habit.

The shape:

```csharp
int major = Major.CompareTo(other.Major);
if (major != 0)
{
    return major;
}
// ... and so on down the parts
```

Handle the `null` argument first, before you touch `other` at all.

## Hint 3

The contract you are implementing has rules, and the gate checks two of them:
`x.CompareTo(x)` must be 0, and `null` sorts before everything, so
`x.CompareTo(null)` is positive. It must also be *consistent* — if `a` is
before `b` and `b` before `c`, then `a` must be before `c`. A comparison built
from a chain of part comparisons gets that for free; one built from a clever
formula usually does not.

Left to you: whether to return the raw result of the final `CompareTo` or
normalise everything to -1/0/1. Both satisfy the contract — the framework only
looks at the sign.
