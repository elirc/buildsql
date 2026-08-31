# Reading - csharp/d03_control_flow

## Notes

Control flow is the part of a language you stop noticing, which is exactly why
it is worth drilling. The pattern uniting these eight problems is **stating the
invariant before writing the loop**: what is true at the top of each iteration,
what the loop variable means, and what the answer is when the loop body never
runs at all.

Nearly every bug in this set is an edge that the middle of the range hides. An
empty array, a single element, a value of zero, the largest negative int, a run
of one character, the last line of the buffer. A loop that is right for
`{4, 7, 4, 9}` and wrong for `{}` is not almost right - it is a crash waiting
for a quiet Tuesday, and the habit that prevents it is naming the empty case
out loud before you type the `for`.

The other half of the set is patterns. C#'s switch expression has quietly grown
into a small language of its own - constants, types, ranges, properties,
combinators - and arms are tested strictly in order, so ordering *is* the
logic.

## ex1

Really testing: an accumulator loop with a compound condition, and one
notorious overflow. The classic mistake in `SumOfMultiples` is two separate
`if` statements, which counts 15 twice for divisors 3 and 5; one condition with
`||` cannot make that mistake. The classic mistake in `CountDigits` is
`while (n > 0)` with the counter starting at 0, which answers 0 for the input
0. The model answer starts the count at 1 and loops while there are ten or more
left. The sting is `Math.Abs(int.MinValue)`: the negative range of a
two's-complement int is one wider than the positive range, so there is no
positive `int` for it and `Math.Abs` throws. Widening to `long` first is the
fix, and knowing why is a good interview answer.

## ex2

Really testing: switch expressions with or-patterns and relational patterns,
and the fact that arms are ordered. The classic mistake in `Ticket` is putting
the negative-age guard anywhere but first, where `< 5` swallows it and a
-3-year-old travels free. The model answer leans on ordering so each arm names
only its upper bound - `< 5`, `< 18`, `< 65` - which halves the number of
boundary numbers in the code and therefore halves the places an off-by-one can
hide. The other lesson is the discard arm: a non-exhaustive switch expression
throws `SwitchExpressionException` at run time, which tells the caller nothing,
so the `_` arm is where you throw something useful.

## ex3

Really testing: early return, and the two ends of an array. The classic mistake
is the backwards loop written as `for (int i = values.Length; i > 0; i--)`,
which either indexes past the end or never looks at element 0 - and both
versions pass a four-element test and fail an empty one. The model answer
returns from inside the loop rather than tracking a `found` flag; the flag
version needs an extra variable and an extra branch to say the same thing. The
`-1` sentinel is worth a thought too: it is the BCL's convention
(`IndexOf`, `LastIndexOf`), which is why it is the right choice here even
though a nullable `int?` would be more honest in new code.

## ex4

Really testing: the "consume a run" loop shape, where the inner loop advances
the *outer* loop's index. The classic mistake is putting the array access
before the bounds check in the inner condition - `text[index] == current &&
index < text.Length` - which throws on the last run because `&&` evaluates left
to right. The second classic mistake belongs to the one-loop version: it
accumulates a run and emits it when the character changes, and then forgets
that the final run never triggers a change, so the last group vanishes.
`LongestRunLength` is the same idea with the emit step removed, and its empty
case (0, not 1) is the reminder that a counter initialised before the loop is a
claim about zero iterations.

## ex5

Really testing: pattern precedence and the fact that patterns do not convert.
The classic mistake is putting `int n` above `0` or above the negative arm, at
which point the more specific arms are unreachable - and the compiler will tell
you so, which is a good habit to lean on. The `null` arm has to be first
because a type pattern never matches null: `null is object` is false, which
surprises people. The `3.5` case is the deep one: a boxed `double` does not
match `int` even though 3.5 is "obviously" a number, because pattern matching
tests the runtime type and applies no numeric conversion. Same rule as
`(object)1 is long` being false.

## ex6

Really testing: nested loops where the inner bound depends on the outer
variable. The classic mistake in `CountPairs` is starting the inner loop at 0
or at `i`, which counts each pair twice or pairs an element with itself
respectively; `j = i + 1` is the standard fix and is worth having in your
fingers, because half the "count the pairs" interview questions are this loop.
The classic mistake in `Triangle` is a trailing newline, which every "why does
my output have a blank last line" bug report is made of. Appending the
separator before every row except the first has no cleanup step, exactly as in
d02 ex4.

## ex7

Really testing: whether you can turn a written specification into a loop
without rewriting the specification. The classic mistake is doubling from the
left - "every second digit" counted from the start gives the wrong parity for
odd-length inputs, which is why the model answer walks backwards. The second
classic mistake is counting characters rather than digits when deciding what to
double, so a hyphen shifts the parity and a number that a human typed with
separators fails. Keeping a separate `seen` counter, incremented only for
digits, makes the separators genuinely invisible. The length rule is worth
noticing as a design point: `"0"` passes the arithmetic and is still not a
card number, so validity is the *conjunction* of two independent checks.

## ex8

Really testing: writing a scanner - the same shape as every tokeniser,
`TryParse` and JSON reader in existence. One index that only moves forward, one
"while the character here is what I want" loop per grammar element, and one
final check that the whole input was consumed. The classic mistake is omitting
that final check, which turns "is this a number?" into "does this *start* with
a number?" and quietly accepts `"1.2.3"`, `"1a"` and `"12,34"`. The second
classic mistake is `char.IsDigit`, which is true for digits in every writing
system Unicode knows about - including many that no `decimal.Parse` in your
program will accept. `char.IsAsciiDigit` says what this grammar actually means.

## Further reading

- [Iteration statements](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/iteration-statements) - `for`, `foreach`, `while`, `do`.
- [Selection statements](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/selection-statements) - `if` and the switch statement.
- [Pattern matching](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns) - every pattern kind, in precedence order.
- [The switch expression](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/switch-expression) - exhaustiveness and `SwitchExpressionException`.
- [`char` methods](https://learn.microsoft.com/en-us/dotnet/api/system.char) - `IsAsciiDigit`, `IsDigit`, `IsLetterOrDigit` and how they differ.
- [Jump statements](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/jump-statements) - `break`, `continue`, `return`, `goto`.
