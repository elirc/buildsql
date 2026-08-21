## Hint 1

Two bodies. `Add` has a guard and a return; `ToString` is one interpolated
string.

The thing to notice while you write `Add`: you cannot assign to `Amount`. The
struct is `readonly`, so the only way to "change" money is to produce a
different `Money`. That constraint is the feature.

## Hint 2

The guard compares `other.Currency` with this instance's `Currency` and throws
`InvalidOperationException` when they differ — not `ArgumentException`; the
problem is the *state* the operation was attempted in, not one bad argument.
(Both are defensible; the gate wants the first.)

Then return `new Money(...)` with the summed amount and the shared currency.

For `ToString`, two decimal places and no surprises from the machine's locale:

```csharp
Amount.ToString("0.00", CultureInfo.InvariantCulture)
```

The `using System.Globalization;` at the top of the file is already there.

## Hint 3

```csharp
public Money Add(Money other)
{
    if (/* currencies differ */)
    {
        throw new InvalidOperationException($"Cannot add {other.Currency} to {Currency}.");
    }

    return new Money(/* the sum */, Currency);
}
```

One thing left to look at rather than write: the gate's last check asserts that
two separately constructed `Money` values are `Equals`. You did not implement
that — structs compare memberwise out of the box. Lesson 06's ex4 shows what a
class has to do to earn the same behaviour.
