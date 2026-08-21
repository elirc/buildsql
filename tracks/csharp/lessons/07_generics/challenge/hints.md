## Hint 1

Both methods are the accumulate-in-a-loop shape you have written four times
now. The new thing is the constraint: `where T : INumber<T>` says T is a
number, which is what lets you use `+` and `/` on two Ts at all.

The problem it solves: what do you initialise the running total to, when you do
not know whether T is `int`, `double` or `decimal`?

## Hint 2

`T.Zero` — a *static abstract member* on the interface, new since .NET 7. The
interface can demand statics, so `T.Zero`, `T.One` and `T.CreateChecked(...)`
are all available through the constraint.

```csharp
T total = T.Zero;
foreach (T value in values)
{
    total += value;
}
```

`Average` needs to divide by the count. `count` is an `int` and the total is a
`T`, and C# will not mix them — `T.CreateChecked(count)` converts, throwing if
the value would not fit.

## Hint 3

Count and total in the *same* loop rather than calling `Total` and then
counting separately: an `IEnumerable<T>` may be a lazy sequence that is
expensive (or impossible) to walk twice. That habit is exactly what lesson 10's
deferred-execution exercise is about, and it starts here.

The empty check comes after the loop, when you know the count, and throws
`InvalidOperationException` — the same choice `Max` made in ex2.

Left to you: whether to use `T.CreateChecked` or `T.CreateSaturating`. The
first throws on overflow and the second clamps; for a count either is fine, and
knowing they are different is the point.
