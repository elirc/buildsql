## Hint 1

`record struct` is a value type with the record conveniences bolted on: value
equality, `ToString`, `Deconstruct`, `with`. Its components are **settable**,
so `tally.Wins++` compiles.

`readonly record struct` locks that down - nothing may be reassigned, and `with`
is the only way to get a changed copy.

## Hint 2

```csharp
public static Tally BumpWins(Tally tally)
{
    tally.Wins++;
    return tally;
}
```

That method modifies the parameter and the caller sees nothing, because a
struct parameter is a copy. Write the same method for a class and both change.
Which behaviour you want is exactly the class-or-struct decision.

`Mirror` is `point with { X = -point.X }`, and `Score` is a deconstruction:
`(int wins, int losses) = tally;`.

The `default(Point)` check is a hint about ex6: for a `Point` the zeroed
default is a perfectly good value, so nothing is wrong. That is not true of
every struct, and knowing which of your structs have a meaningful zero is the
difference between a safe value type and a trap.
