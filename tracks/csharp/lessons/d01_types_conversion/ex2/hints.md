## Hint 1

C# picks the arithmetic from the operand types, not from the type you are
assigning to. `int / int` is integer division even when the result is going
straight into a `double`, so `1 / 3` is `0` and `(double)(1 / 3)` is `0.0`.

The fix is to make one operand a `double` *before* the divide happens.

## Hint 2

Multiplying by `100.0` (note the `.0`) widens the whole expression:

```csharp
return Math.Round(part * 100.0 / whole, 1, MidpointRounding.AwayFromZero);
```

`Math.Round`'s two-argument overload uses to-even rounding, which would answer
6.2 for 6.25. The specification says away from zero, so the third argument is
not optional.

For the integer version the order is the whole exercise: `part * 100 / whole`
keeps the precision that `part / whole * 100` has already lost.
