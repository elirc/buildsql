## Hint 1

Do the whole calculation in **whole cents**, as integers, and convert back to
`decimal` only at the very end. Dividing decimals and rounding each share is
the approach that loses money, because three lots of 3.33 is 9.99.

Once you are in cents the problem is just integer division and remainder -
which you drilled in d01 ex1.

## Hint 2

```csharp
long cents = (long)Math.Round(total * 100m, 0, MidpointRounding.AwayFromZero);
long baseShare = cents / ways;
long extra = cents % ways;
```

`extra` is how many shares need one more cent, and it is always less than
`ways` - so "one cent each to the first `extra` shares" always fits:

```csharp
shares[i] = (baseShare + (i < extra ? 1 : 0)) / 100m;
```

Note the `100m`: dividing by `100` (an int) would still be decimal arithmetic
because `baseShare` is widened, but writing the literal as a decimal says what
you mean.

Guard both arguments before any of that. A `ways` of 0 must raise
`ArgumentOutOfRangeException` rather than reaching the division - the runtime's
own `DivideByZeroException` would name the wrong problem.
