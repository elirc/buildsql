# Reading - csharp/02_control_flow_methods

## Notes

**Statements do, expressions are.** The through-line of this lesson is a shift
that C# has been making for years: replacing constructs that *perform steps*
with constructs that *produce values*. A `switch` statement jumps to a label
and relies on you to assign the right variable in each arm; a `switch`
expression *is* the value, so there is no arm that forgets to assign and no
variable that exists in a half-built state. Same for `?:` against `if`/`else`,
and for `=>` bodies against braces. The practical payoff is that expressions
compose — you can pass one to a method, return it, or drop it inside an
interpolated string — and that the compiler can check exhaustiveness, which it
cannot do for a statement that merely assigns.

**Argument passing, exactly.** By default C# passes arguments *by value*: the
parameter is a fresh variable initialised from the argument. For a class that
means the reference is copied, so the method can mutate the object but cannot
repoint the caller's variable. `ref` and `out` change this: the parameter
becomes an alias for the caller's variable itself, so an assignment inside the
method is visible outside. The difference between them is who must assign
first — `ref` requires the caller to, `out` requires the method to. There is
also `in`, which passes a read-only alias and exists mainly to avoid copying
large structs.

**Why `out` feels clumsy, and what replaced it.** Writing `out` at the call
site is noise, which is why C# 7 added inline declarations
(`TryParse(s, out int n)`) and why modern APIs increasingly return a tuple
instead: `static (int min, int max) MinMax(...)`. Tuples are usually the better
choice for two ordinary results; `out` earns its keep in the `Try...` pattern,
where the `bool` is the *primary* answer and the value is conditional on it.
Knowing both, and knowing when each reads better, is a reasonable interview
answer.

**Loop choice is a communication decision, not a performance one.** All three
loop forms compile to nearly identical IL for an array. `foreach` says "every
element, in order, no index arithmetic"; `for` says "the position matters";
`while` says "I do not know how many times". Choosing the one that matches your
intent is how a reader knows what to check for. The classic bug `foreach`
eliminates is the off-by-one, and the classic bug it introduces is trying to
modify the collection while enumerating it — which throws
`InvalidOperationException` at runtime, by design.

## ex1

The interesting part is not the loop, it is where the separator lives.
Appending `n + ", "` inside the loop builds the string *and* the punctuation
together, which means the last element is special and the empty case is
special. Collecting the pieces and calling `string.Join(", ", parts)` at the
end separates "what are the items" from "how are they rendered", and the two
awkward cases evaporate.

That is a small instance of a large idea: **build the data, then format it**.
The same reflex is why you will hear "don't build HTML with string
concatenation" and "don't build SQL by gluing text together". The formatting
step is where the edge cases live, so give it one place to live in.

Performance footnote, since someone always asks: repeated `+=` on a `string` in
a loop allocates a new string every iteration, because strings are immutable.
For a handful of items nobody cares. For thousands, use `StringBuilder`, which
keeps a mutable buffer and produces the string once. `string.Join` already does
the efficient thing internally.

## ex2

`out` parameters exist because a method returns exactly one value and sometimes
one is not enough. The compiler's definite-assignment analysis is doing real
work here: it will not let you `return false;` before assigning `min` and
`max`, which is why assigning both at the top of the method is the tidy
pattern rather than a trick.

The `Try...` convention is worth internalising because .NET is full of it and
because interviewers ask the design question behind it. `int.Parse` throws;
`int.TryParse` returns a `bool`. The rule: **if the caller can reasonably
expect this input to fail, do not make failure an exception.** Exceptions are
expensive (stack capture, unwinding) and, more importantly, they are a
different control-flow channel — using them for ordinary outcomes makes normal
code read like error handling.

`params` is a compiler trick, not a runtime feature: at the call site, the
compiler collects the loose arguments into a real array and passes that. Which
means every call allocates one, so hot paths sometimes offer overloads for one
and two arguments to avoid it — `string.Format` does exactly that. Notice also
that `params` must be the last parameter, for the obvious reason that the
compiler would otherwise not know where the array stops.

## ex3

Optional arguments are the feature people most often get subtly wrong, because
of *where* the default lives. The compiler embeds the default value into the
**caller's** compiled code. If a library ships `Log(string m, string level = "info")`
and version 2 changes the default to `"warn"`, existing callers that were not
recompiled keep passing `"info"` forever. That is why public library APIs
often prefer overloads (`Log(m)` calling `Log(m, "info")`), where the default
lives in one place that ships with the library.

Named arguments solve the other problem: a call like `Configure(true, false, true)`
tells the reader nothing. `Configure(retry: true, verbose: false, cache: true)`
tells them everything, and it costs nothing at runtime. The rule of thumb most
teams use: name your booleans at the call site. Which also means your parameter
names are part of your public API, and renaming one is a breaking change for
anyone who used it by name.

`ToUpperInvariant` over `ToUpper` is the other habit in this exercise.
Culture-sensitive upper-casing is right for text shown to a human and wrong for
anything you compare or store — the standard example is Turkish, where the
upper-case of `i` is `I` and `"file".ToUpper() == "FILE"` is false.

## ex4

Switch expressions with relational patterns replace the `if/else if` ladder
that every grading function used to be, and they are better for a specific
reason: the compiler checks them. Leave a gap and you get a warning that not
all inputs are handled; write an arm that can never be reached — put `>= 60`
above `>= 90` — and you get a warning for that too. An `if` ladder gets neither.

Keeping the range guard *out* of the switch is the design point. You could
write an arm for `< 0` that throws, and it would work, but then the switch is
doing two jobs: validating and classifying. Guard clauses at the top are the
convention because they let a reader skip to the interesting part knowing
exactly what is already ruled out.

`ArgumentOutOfRangeException` rather than a plain `ArgumentException` is a
small piece of etiquette worth copying: .NET has a specific exception for "the
value is the right type but outside the allowed range", and its constructor
takes the parameter name and the offending value so the message writes itself.
`nameof(score)` keeps that name correct through a rename. Lesson 12 covers the
whole family.

## challenge

The Collatz sequence is the standard teaching example for `while` because you
cannot express the trip count as a `for` header — there is no formula for how
many steps a number takes, and proving there always *is* a finite number is an
open problem in mathematics. That is the honest reason the loop form exists.

Two details worth keeping. First, the intermediate value climbs: starting at
27, the sequence reaches 9232 before descending. Nothing here overflows an
`int`, but the habit of widening the running value to `long` is the right one —
run the same search up to a million and the peaks reach into the billions.
Second, the tie-break. `if (count > best)` keeps the first winner and
`if (count >= best)` keeps the last, and no test you write by accident will
tell you which you meant. Deciding tie-breaks explicitly is the same discipline
as writing `ORDER BY` with a unique tiebreaker column in SQL.

A performance aside, because it is the natural follow-up question: this brute
force recomputes the whole chain for every start, and the standard improvement
is memoising the step counts in a dictionary, since most chains merge into ones
you have already walked. That is a fine thing to try after the gate is green —
`08_collections` gives you the dictionary.

## review1

Same `Try...` shape, same running-best loop, different element type — and the
tie-break question again, now as "which of two five-letter words wins". If the
`>` versus `>=` decision was the part you had to think about, that is the point
of the review appearing at all: the shape is easy to recall and the tie-break
is the part that decays.

The `StringSplitOptions.RemoveEmptyEntries` detail is the other thing this
variant is quietly teaching. `"a  b".Split(' ')` produces three items, the
middle one empty, because splitting is literal about separators. Every language
has this and every developer gets bitten by it once.

## Further reading

- [Iteration statements](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/iteration-statements) — `for`, `foreach`, `while`, `do`, and what `foreach` actually compiles into.
- [Method parameters: `ref`, `out`, `in`, `params`](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters) — the whole family in one page, with the definite-assignment rules.
- [Named and optional arguments](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/named-and-optional-arguments) — including the call-site-baking behaviour that makes defaults a versioning decision.
- [Pattern matching and `switch` expressions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns) — relational patterns, `and`/`or`, and exhaustiveness.
- [The `Try...` pattern (`int.TryParse`)](https://learn.microsoft.com/en-us/dotnet/api/system.int32.tryparse) — the canonical example, with the design rationale in the remarks.
