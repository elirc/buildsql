## Hint 1

An explicit cast between numeric types is not a conversion in the friendly
sense - it is a reinterpretation with a documented rule:

- double to int: drop the fraction, toward zero. Undefined if it does not fit.
- int to byte: keep the low 8 bits.
- int to char: that UTF-16 code unit.

Three of the four methods are one line each. The interesting one is the fourth,
because it has to decide whether the cast is legal *before* performing it.

## Hint 2

`unchecked((byte)value)` makes the wrapping explicit. It is the default at run
time, but saying it stops a future `<CheckForOverflowUnderflow>` in the project
file from changing your method's meaning, and it tells a reader the truncation
is deliberate.

For the safe conversion, three questions in order:

```csharp
if (double.IsNaN(value) || double.IsInfinity(value)) return false;
if (value < int.MinValue || value > int.MaxValue) return false;
result = (int)value;
```

NaN has to go first: every comparison involving NaN is false, so a range check
alone would let it through and the cast would hand back an unspecified number.

Left to you: whether the range check should reject `2147483647.5` (it is above
`int.MaxValue`, so the check above rejects it) or truncate it first. Decide
which behaviour you would want as the caller and be able to say why.
