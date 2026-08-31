# Reading - csharp/d04_methods_params

## Notes

A method signature is a contract, and C# gives you an unusual number of ways to
write one: optional parameters, named arguments, `params`, `out`, `ref`, `in`,
and overloads. The pattern uniting these eight problems is that **each of those
features moves a decision to a different place**, and knowing which place is
the skill.

An optional parameter moves the default into the callee, where every caller
inherits it - and freezes it into every calling assembly at compile time, which
is why changing a default is a subtly breaking change. `params` moves the array
construction to the compiler. `out` moves "did it work?" out of the return
value so the return value can be a plain bool. `ref` moves the variable itself
across the boundary. Overloads move the choice to the compiler, using rules
that are precise, documented, and almost never what people guess.

The second thread is the Try-pattern, which appears twice: a bool return plus
`out` results, and the discipline that a false return leaves the outputs at a
known value rather than half-written.

## ex1

Really testing: that optional parameters and named arguments are two halves of
one feature. Without named arguments, a caller who wants to set the third
parameter must also pass the second, which is why long optional lists are
unusable in languages that lack them. The classic mistake is treating the
default as data - `string level = DateTime.Now.ToString()` will not compile,
because defaults must be compile-time constants. The subtler trap, worth
knowing before it bites you: the default is baked into the *caller's* compiled
code, so changing `"INFO"` to `"TRACE"` in a shipped library changes nothing
for callers until they recompile.

## ex2

Really testing: that `params` is a caller-side convenience and nothing more.
Inside the method it is an array, it is never null when the method is called
normally, and `foreach` over an empty one is a no-op - which is why neither
method here needs a guard. The classic mistake is a null check that can only
fire when someone explicitly passes `null` as the array. The `Trim().Trim('/')`
detail is the interesting part of `Combine`: the two overloads do different
jobs, and applying them in the wrong order leaves a slash behind on `" /a/ "`.

## ex3

Really testing: the Try-pattern's contract. The bool is the only trustworthy
output when the call fails, and the way to guarantee that is to assign the
outs on the first line rather than on each failure path. The classic mistake is
returning `false` after writing `low` but before writing `high`, leaving the
caller with a plausible half-parsed range - and the compiler will not stop you,
because `out` only requires *definite assignment*, not consistency. The
`"-3-9"` case is a small gift: splitting on `-` produces three fields, so the
length check rejects negative bounds before any parsing is attempted.

## ex4

Really testing: the difference between passing a value and passing a variable.
`ref` gives the method an alias for the caller's storage; a plain parameter
gives it a copy. The classic misconception is that this is about value types
versus reference types - it is not. Passing a `List<T>` by value still lets the
method call `.Add` (the object is shared) but not reassign the caller's
variable; passing it by `ref` allows both. The `BumpByValue` method mutates its
parameter deliberately so you can watch the caller's variable stay at 5. And
`ref`/`out` must be written at the call site, which is C# choosing readability
over convenience: your variable cannot be reassigned by a method invisibly.

## ex5

Really testing: whether you can predict overload resolution rather than
discover it. The rules in play, in order: applicable candidates first; a method
applicable in normal form beats one applicable only in expanded (`params`)
form; then the most specific parameter type wins, where "more specific" means
"converts implicitly to the other". So `short` picks `int` over `long`,
`double` and `object`; `float` picks `double` because widening beats boxing;
`bool` picks `object` because nothing else applies. The classic mistake is
assuming a `params` overload is a catch-all - it is the *last* resort, which is
why adding one to an existing API is usually safe.

## ex6

Really testing: composing small methods, and two arithmetic traps. Euclid's
loop handles `Gcd(0, n)` and `Gcd(0, 0)` with no special case, which is worth
noticing - a well-chosen loop condition often deletes the edge cases rather
than handling them. In `Lcm` the trap is `a * b / gcd`: the multiplication
overflows for inputs whose correct answer fits comfortably, so divide first.
In `PowerOf` the trap is guarding after the recursive call rather than before,
which turns a bad argument into a `StackOverflowException` - the one .NET
failure you cannot catch, because there is no stack left to run a handler on.

## ex7

Really testing: the standard fix for "the parts do not add up to the whole".
Work in the smallest indivisible unit - cents - as integers, and distribute the
remainder explicitly. The classic mistake is `Math.Round(total / ways, 2)` per
share, which loses or gains a cent and produces the support ticket that starts
"our invoices are off by one penny". Note that the remainder is always smaller
than the number of shares, so "one extra cent to the first `extra` shares"
always terminates and always uses up exactly the remainder. The guards are the
other half: a `ways` of 0 must be an `ArgumentOutOfRangeException` naming the
parameter, not a `DivideByZeroException` naming nothing.

## ex8

Really testing: a scanner with lookahead, which is the same shape as d03 ex8
plus one extra move - consuming a token. The classic mistake is `foreach`,
which cannot skip ahead, so `--level 3` leaves `3` to be re-examined as a
positional argument. The second classic mistake is `Split('=')` instead of
`IndexOf('=')`, which mangles any value containing an `=`. The lower-cased key
with a case-preserved value is a deliberate asymmetry: the key is a protocol
token and the value is user data, and the rule "normalise your protocol, never
your payload" generalises well past command lines.

## Further reading

- [Named and optional arguments](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/named-and-optional-arguments) - the rules, and the versioning caveat.
- [`params` modifier](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/params) - including the newer `params` collections.
- [Method parameters: `ref`, `out`, `in`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters) - all the passing modes in one page.
- [Overload resolution](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/expressions#1264-overload-resolution) - the specification section the ex5 answers come from.
- [The Try-pattern](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/exceptions-and-performance) - when to return a bool instead of throwing.
- [`Math.Round`](https://learn.microsoft.com/en-us/dotnet/api/system.math.round) - the overloads ex7 depends on.
