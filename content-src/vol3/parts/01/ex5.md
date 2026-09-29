@@PROMPT@@
## Exercise 5 - the allocation you did not write

Edit `src/Lessons/V3CC01_GcGenerations/Ex5.cs`.

Three summing routines over the same numbers, and one measurement.

- `Totals.SumBoxed(IEnumerable<object> values)` — casts each element back to
  `int` and adds. Every element arrived boxed.
- `Totals.SumGeneric<T>(IEnumerable<T> values) where T : INumber<T>` — adds
  without boxing anything.
- `Totals.BoxAll(IReadOnlyList<int> values)` — returns `object[]`, the boxing
  step, so the gate can hand the same numbers to both paths.
- `Totals.CompareCost(int count)` — builds `0 .. count - 1`, then returns
  `(long Boxed, long Generic)`: the bytes allocated by boxing-then-summing and
  the bytes allocated by summing the `int` values directly.

```
SumBoxed(new object[] { 1, 2, 3 })   -> 6
SumGeneric(new[] { 1, 2, 3 })        -> 6
SumGeneric(new[] { 1.5, 2.5 })       -> 4.0
CompareCost(10_000)                  -> Boxed around 240,000+, Generic near 0
```

The gate asserts `Boxed > Generic * 10` and that both totals agree.

```
uv run dojo test csharp v3cc01_gc_generations ex5
```
@@HINTS@@
## Hint 1

A boxed `int` on 64-bit costs 24 bytes: header word, method table pointer,
four bytes of payload, four of padding. Ten thousand of them is a quarter of a
megabyte of garbage that never appears in your source as a `new`.

## Hint 2

Generic math is the constraint that makes the second version allocation-free:

```csharp
static T Max<T>(T a, T b) where T : INumber<T> => a > b ? a : b;
```

`INumber<T>` (System.Numerics, .NET 7+) brings `T.Zero`, `T.One` and the
operators with it, so `total += v` compiles to an add for each value type the
JIT specialises.

## Hint 3

`SumGeneric` starts from `T.Zero` and accumulates with `+=`. The subtle part
is what you must *not* do: taking `IEnumerable<IComparable>` or calling
`v.CompareTo(other)` through an interface-typed local puts the boxing straight
back. Keep every operation on the constrained type parameter, and decide
whether your `CompareCost` should include the cost of building the source list
in both measurements or neither.
@@IMPORTANT@@
## Hint 1

Ask where a value type has to live in order to be reachable through an
`object` reference. It cannot live on the stack — the reference would dangle.
So the runtime copies it onto the heap and hands you a pointer to the copy.
That copy is the box, and every cast back is a copy in the other direction.

## Hint 2

Boxing hides in more places than `object`. All of these box a value type:

```csharp
object o = 42;                          // the obvious one
IComparable c = 42;                     // interface-typed variable
ArrayList list = new(); list.Add(42);   // the pre-generics API
string s = string.Format("{0}", 42);    // params object[]
```

`Console.WriteLine($"{x}")` does not, because interpolated string handlers take
the value generically.

## Hint 3

If your generic version still allocates, the enumerator is usually the culprit
rather than the arithmetic: `IEnumerable<T>` forces an interface-dispatched
enumerator object. Measuring an array or a `List<T>` through its concrete type
gives the struct enumerator and near-zero bytes — worth trying both and noticing
the difference, since that is exactly the trade the BCL made.
@@REF@@
// v3cc01_gc_generations / ex5 - the allocation you did not write.
// See lessons/v3cc01_gc_generations/README.md, "Exercise 5".

using System.Numerics;

namespace CSharpDojo.V3CC01_GcGenerations;

public static class Totals
{
    /// <summary>Sums values that arrived boxed. Each cast is an unbox.</summary>
    public static long SumBoxed(IEnumerable<object> values)
    {
        ArgumentNullException.ThrowIfNull(values);

        long total = 0;
        foreach (object value in values)
        {
            total += (int)value;
        }

        return total;
    }

    /// <summary>
    /// Sums without boxing: every operation stays on the constrained type
    /// parameter, so the JIT compiles a specialised body per value type.
    /// </summary>
    public static T SumGeneric<T>(IEnumerable<T> values) where T : INumber<T>
    {
        ArgumentNullException.ThrowIfNull(values);

        T total = T.Zero;
        foreach (T value in values)
        {
            total += value;
        }

        return total;
    }

    /// <summary>Boxes every element - the step being measured.</summary>
    public static object[] BoxAll(IReadOnlyList<int> values)
    {
        ArgumentNullException.ThrowIfNull(values);

        object[] boxed = new object[values.Count];
        for (int i = 0; i < values.Count; i++)
        {
            boxed[i] = values[i];
        }

        return boxed;
    }

    /// <summary>
    /// Bytes allocated by boxing-then-summing versus summing the values as
    /// they are. The source list is built once, outside both measurements.
    /// </summary>
    public static (long Boxed, long Generic) CompareCost(int count)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(count);

        int[] source = new int[count];
        for (int i = 0; i < count; i++)
        {
            source[i] = i;
        }

        long boxedTotal = 0;
        long boxedBytes = AllocationProbe.BytesFor(() => boxedTotal = SumBoxed(BoxAll(source)));

        int genericTotal = 0;
        long genericBytes = AllocationProbe.BytesFor(() => genericTotal = SumGeneric<int>(source));

        if (boxedTotal != genericTotal)
        {
            throw new InvalidOperationException("the two sums disagree");
        }

        return (boxedBytes, genericBytes);
    }
}
