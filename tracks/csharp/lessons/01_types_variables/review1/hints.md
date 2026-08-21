## Hint 1

This is ex3 and ex2 in one method. The label falls back exactly the way the
name did; the temperature has to become a whole number the way ex2's rounding
did.

Notice that a missing reading does not print a fallback *number* — it replaces
the whole temperature-and-C part.

## Hint 2

Because the missing-reading case changes the shape of the output rather than
one value inside it, an early `return` is cleaner here than a conditional
expression:

```csharp
string name = /* the fallback you already know */;
if (/* no reading */)
{
    return $"{name}: no reading";
}
```

Then the normal path below it does the rounding and the interpolation.

## Hint 3

`double?` unwraps with `.Value` once you know `HasValue` is true, and
`Math.Round` still hands you a `double`, so the cast to `int` is still yours to
write. The suffix on the output is a bare `C` with no space:
`$"{name}: {degrees}C"`.

The rounding mode is the same one you have now used three times. If you cannot
remember which of 20.5 and 20.4 is the interesting one, look at the gate.
