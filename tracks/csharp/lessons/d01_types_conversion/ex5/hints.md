## Hint 1

`double` stores numbers in base 2, and one tenth is a recurring fraction in
base 2 exactly as one third is in base 10. Every `0.1` you write is really the
nearest double to 0.1, and the errors accumulate as you add.

`decimal` stores numbers in base 10 with 28-29 significant digits, so tenths
are exact - which is why money belongs in `decimal` and physics does not.

## Hint 2

Both experiments are the same three lines: a running total, a `for` loop adding
the literal, and a comparison against `times / 10.0` (or `times / 10m`). Do not
try to be clever - the point is to watch it fail.

The two rounding methods differ only in their third argument:

```csharp
Math.Round(value, 2, MidpointRounding.AwayFromZero);
Math.Round(value, 2, MidpointRounding.ToEven);
```

To-even is the default, and it is a defensible default: over many roundings the
up-and-down errors cancel instead of drifting upward. It is still not what a
tax authority means by "round to the nearest cent".
