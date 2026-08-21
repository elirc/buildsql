## Hint 1

Three steps in order: gross (price times quantity), then the discount taken
off, then the rounding. Do them in that order and each one is a single
expression.

`discountPercent` is a percentage — `10m` means ten percent, not ten times.
Divide by something before you subtract.

## Hint 2

Every intermediate value should be a `decimal`. If you find yourself writing
`(double)` anywhere, back out — the entire point of `decimal` is that it never
leaves the world of exact base-10 fractions, and one round trip through
`double` loses that.

`quantity` is an `int`, and multiplying a `decimal` by an `int` is fine: the
`int` widens to `decimal` implicitly with no loss.

Rounding to a number of decimal places is `Math.Round(value, digits, mode)`.

## Hint 3

```csharp
decimal gross = unitPrice * quantity;
decimal net   = gross - (gross * discountPercent / 100m);
return Math.Round(net, /* how many places? */, /* which mode? */);
```

The literal suffix matters: `100m` is a `decimal`, `100` is an `int`, and
`100.0` is a `double` that would drag the whole expression into floating point.
The mode is the same one ex2 asked for.
