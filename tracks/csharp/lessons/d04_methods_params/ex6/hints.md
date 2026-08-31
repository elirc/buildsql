## Hint 1

Euclid's algorithm: replace `(a, b)` with `(b, a % b)` until `b` is 0; the
answer is what is left in `a`. Written that way, `Gcd(0, 5)` and `Gcd(0, 0)`
both come out right with no special case - work through them on paper to see
why.

`Lcm` is `a / Gcd(a, b) * b`. The order matters, and so does the type.

`PowerOf` is the standard recursion: the base case is exponent 0.

## Hint 2

```csharp
long x = Math.Abs((long)a), y = Math.Abs((long)b);
while (y != 0) { (x, y) = (y, x % y); }
```

The widening to `long` is for the same reason as d03 ex1: `Math.Abs` on
`int.MinValue` throws.

For `Lcm`, divide before multiplying. `a * b / Gcd(a, b)` overflows for values
that the correct answer would fit in comfortably - dividing first keeps every
intermediate no bigger than the result.

For `PowerOf`, the guard has to come before the recursive call, or a negative
exponent counts downwards forever and you get a `StackOverflowException` -
which, unlike almost every other .NET exception, cannot be caught and kills the
process.

Left to you: recursion or a loop for `PowerOf`, and whether to be clever with
exponentiation by squaring. State the complexity of whichever you pick.
