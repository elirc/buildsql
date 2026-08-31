## Hint 1

`SumOfMultiples` is one `for` loop with one `if` whose condition uses `||`.
Writing two separate `if`s - one per divisor - double-counts anything divisible
by both, which is exactly what the 16/3/5 case in the gate is checking.

`CountDigits` is a `while` loop that divides by 10 until there is nothing left,
counting as it goes. Start by asking what "nothing left" means for the input 0.

## Hint 2

Start the digit count at 1 and loop while the remaining value is 10 or more:

```csharp
int digits = 1;
while (remaining >= 10) { remaining /= 10; digits++; }
```

That shape handles 0 and single digits without a special case.

The sting is `Math.Abs(int.MinValue)`, which throws `OverflowException` -
there is no positive `int` equal to 2147483648. Widen first:
`Math.Abs((long)value)` does the abs in `long`, where the value fits.
