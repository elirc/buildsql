@@PROMPT@@
## Exercise 1 - measuring what a delegate allocates

Edit `src/Lessons/V3CC01_GcGenerations/Ex1.cs`.

`AllocationProbe.BytesFor(Action work)` returns the number of bytes allocated
on the calling thread while `work` runs, using
`GC.GetAllocatedBytesForCurrentThread()`. A delegate that allocates nothing
must report `0`.

`AllocationProbe.CompareBuilders(int count)` returns
`(long Naive, long Builder)`: the bytes allocated by joining the numbers
`0 .. count - 1` with `result += i.ToString()` in a loop, and the bytes
allocated by the same join through a `StringBuilder`. Both must produce the
same string; only the byte counts differ. `count` below zero throws
`ArgumentOutOfRangeException`.

```
CompareBuilders(200)   ->  Naive around 60,000, Builder under 2,000
CompareBuilders(0)     ->  both tiny, both non-negative
```

The gate asserts `Naive > Builder * 5` and that both joins produce
`"0123...199"`, not exact byte counts — those move between runtimes.

```
uv run dojo test csharp v3cc01_gc_generations ex1
```
@@HINTS@@
## Hint 1

The probe is three lines and no cleverness: read the counter, run the
delegate, read it again, subtract. Do not call `GC.Collect()` first — this
counter is a monotonic total of bytes handed out, not a measure of live heap,
so a collection changes nothing about it.

## Hint 2

The measurement shape, applied to something else:

```csharp
long before = GC.GetAllocatedBytesForCurrentThread();
var list = new List<int>(capacity: 1024);
long allocated = GC.GetAllocatedBytesForCurrentThread() - before;
```

Keep the work inside the delegate small enough that nothing else on the thread
allocates in between.

## Hint 3

`CompareBuilders` calls `BytesFor` twice, once per strategy, and returns a
tuple. Two details decide whether the numbers are honest: build the string
inside the delegate rather than outside it, and make sure the compiler cannot
discard the result — assign it to a field or a local you later read. Decide for
yourself whether `StringBuilder.Append` should take `i` or `i.ToString()`, then
measure both; the difference is the point of the exercise.
@@IMPORTANT@@
## Hint 1

Come at it from the string side first. Write the two join methods and convince
yourself they return the same text, then wrap them in measurement. If the
strings differ, the byte comparison is meaningless.

## Hint 2

`result += i.ToString()` is not one allocation. Expanded, it is
`result = string.Concat(result, i.ToString())`: a new string for the number,
plus a new string holding everything accumulated so far. That second one grows
every iteration, which is why the total is quadratic in `count`.

## Hint 3

For the guard, `ArgumentOutOfRangeException.ThrowIfNegative(count)` is the
.NET 8 one-liner and it fills in the parameter name for you. For `count == 0`
both loops run zero times and both strings are empty — check your assertion
still holds when the numbers are near zero, and choose the comparison
accordingly.
@@REF@@
// v3cc01_gc_generations / ex1 - measuring what a delegate allocates.
// See lessons/v3cc01_gc_generations/README.md, "Exercise 1".

using System.Text;

namespace CSharpDojo.V3CC01_GcGenerations;

public static class AllocationProbe
{
    /// <summary>
    /// Bytes allocated on the calling thread while <paramref name="work"/>
    /// runs. The counter is a monotonic per-thread total, so the difference is
    /// exact and no collection is needed (or wanted).
    /// </summary>
    public static long BytesFor(Action work)
    {
        ArgumentNullException.ThrowIfNull(work);

        long before = GC.GetAllocatedBytesForCurrentThread();
        work();
        return GC.GetAllocatedBytesForCurrentThread() - before;
    }

    /// <summary>
    /// Joins 0 .. count-1 twice, once by repeated concatenation and once
    /// through a StringBuilder, and reports what each cost in bytes.
    /// </summary>
    public static (long Naive, long Builder) CompareBuilders(int count)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(count);

        string? naiveResult = null;
        string? builderResult = null;

        long naive = BytesFor(() => naiveResult = JoinNaive(count));
        long builder = BytesFor(() => builderResult = JoinBuilder(count));

        if (naiveResult != builderResult)
        {
            throw new InvalidOperationException("the two joins disagree");
        }

        return (naive, builder);
    }

    /// <summary>
    /// Quadratic in bytes: every += copies everything accumulated so far.
    /// </summary>
    public static string JoinNaive(int count)
    {
        string result = string.Empty;
        for (int i = 0; i < count; i++)
        {
            result += i.ToString();
        }

        return result;
    }

    /// <summary>
    /// Linear in bytes. Append(int) formats straight into the builder's
    /// buffer, so the intermediate string is never created.
    /// </summary>
    public static string JoinBuilder(int count)
    {
        StringBuilder builder = new();
        for (int i = 0; i < count; i++)
        {
            builder.Append(i);
        }

        return builder.ToString();
    }
}
