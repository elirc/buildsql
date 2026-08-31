# Reading - csharp/d01_types_conversion

## Notes

Every problem in this set is the same problem wearing a different hat: **C#
decides what kind of arithmetic to do from the operand types, and it decides
before it knows what you meant.** `1 / 3` is `0` because both operands are
`int`. `int.MaxValue + 1` is negative because `+` on two ints is unchecked by
default. `0.1 + 0.1 + 0.1` misses `0.3` because a `double` literal is the
nearest binary fraction, not the number you typed. `Math.Round(2.345m, 2)`
gives 2.34 because the default midpoint rule is to-even.

None of these are bugs in the language - each is a documented, defensible
choice - but every one of them is silent. The skill being drilled is spotting
the moment the decision gets made and taking it deliberately: widen before you
divide, widen before you add, pick a `MidpointRounding`, pick a `CultureInfo`,
and use `Try...` when the input came from a human.

## ex1

What this was really testing: that `/` and `%` on ints are exact tools rather
than approximations of real division. The classic mistake is `totalSeconds /
60 % 60` written as `totalSeconds % 60 / 60`, which is always 0 - the
precedence is left to right, so the remainder has to be taken from the larger
unit before the division. The model answer peels hours first, then takes the
sub-hour remainder and divides by 60. The second classic mistake is assuming
`-119 / 60` is `-2`: C# truncates toward zero, so it is `-1`, and that
difference has bitten every developer who has ever paged backwards through a
list.

## ex2

Really testing: whether you can see the exact instant an expression stops being
integer arithmetic. `part / whole` is evaluated in `int` no matter what the
method returns, so `1 / 3` is `0` and the widening to `double` happens on the
wrong side of the damage. Multiplying by `100.0` first drags the whole
expression into `double`. The mirror-image trap is in `IntegerPercent`, where
the fix is the opposite: keep everything in `int` but multiply *before* you
divide. The 1-in-16 case exists because 6.25 is exactly a midpoint, and the
default `Math.Round` overload rounds it to 6.2 - a silent one-cent-per-invoice
class of bug.

## ex3

Really testing: the difference between "the value is zero" and "there is no
value". `int?` makes that distinction representable, and the classic mistake is
throwing it away - `if (sum == 0) return null`, or `value ?? 0` used where the
absence itself is the answer. The model answer asks the *inputs* whether they
have values and never asks the result. `AverageOfPresent` hides the second
trap: `sum` and `count` are both `int`, so `sum / count` truncates and the mean
of 1 and 2 comes back as 1 - one cast fixes it, and it must be on the division,
not on the return value.

## ex4

Really testing: knowledge that C# integer arithmetic is unchecked by default,
and that this is a choice you can reverse per expression. The classic mistake
in the clamping method is `long sum = (long)(a + b)`: the addition still
happens in `int`, wraps, and then you faithfully widen the wrong number. The
gate calls it with `int.MaxValue` twice precisely to catch that. The model
answer widens one operand - `(long)a + b` - so the addition itself is done in
`long`, then compares against the `int` bounds before narrowing. Saturating
arithmetic is the right shape for counters and gauges; `checked` is the right
shape for anything where a wrong answer is worse than a stopped process.

## ex5

Really testing: that `double` and `decimal` are not "less precise" and "more
precise" versions of each other but different number systems. `double` is
binary and cannot represent a tenth at all; `decimal` is base 10 and
represents it exactly, at roughly a tenth of the speed and with a much smaller
exponent range. The classic mistake is comparing floating-point values with
`==` - which is exactly what this exercise makes you do, so you can watch it
fail. The rounding half is a different lesson: `Math.Round(x, n)` defaults to
banker's rounding, which is statistically sound and almost never what a
financial specification means. Say the mode out loud in the argument list.

## ex6

Really testing: that parsing is a *policy* decision, not a utility call. Which
culture reads the text? Which shapes count as a number? What happens on
failure? The classic mistake is `decimal.Parse(raw)` with no culture, which
reads `"1,234.50"` differently in Berlin than in Boston and throws on any
malformed keystroke. The model answer states the policy in the call itself:
invariant culture, `NumberStyles.Number`, `TryParse` so failure is a return
value rather than an exception. The guard order matters too - reject
null-or-whitespace first, so the later steps can assume there is something to
work with.

## ex7

Really testing: whether you can hold six small rules in your head at once and
still write a clean loop. The classic mistake is rounding inside the loop:
every line gets its own rounding error and the total drifts, which is exactly
the bug that makes an accountant distrust a system. The second classic mistake
is incrementing the line counter after the blank-line `continue`, so the number
in the error message does not match the file the user is looking at. The model
answer counts first, skips second, validates third, and rounds exactly once on
the way out. The error messages name the line because an error that does not
tell you where it happened costs someone an hour.

## ex8

Really testing: that an explicit cast is an instruction, not a request. `(int)`
on a `double` truncates toward zero; `(byte)` on an `int` keeps the low eight
bits; `(char)` on an `int` reinterprets it as a UTF-16 code unit. None of them
check anything at run time. The classic mistake in `TrySafeToInt` is doing the
range comparison before the NaN check: every comparison involving NaN is
`false`, so `value < int.MinValue || value > int.MaxValue` is `false` for NaN
and the value sails through to a cast whose result the specification leaves
unspecified. The model answer asks "is this a real number?" before it asks "is
it in range?", and only then performs the conversion.

## Further reading

- [Integral numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types) - ranges, division, and what `/` does to ints.
- [Floating-point numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types) - why `double` and `decimal` are different tools.
- [`checked` and `unchecked`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/checked-and-unchecked) - the statement, the expression, and the project-wide switch.
- [`MidpointRounding`](https://learn.microsoft.com/en-us/dotnet/api/system.midpointrounding) - all five modes, with the to-even default spelled out.
- [Parsing numeric strings](https://learn.microsoft.com/en-us/dotnet/standard/base-types/parsing-numeric) - `NumberStyles`, cultures, and the Try-pattern.
- [Casting and type conversions](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/casting-and-type-conversions) - implicit widening versus explicit narrowing.
