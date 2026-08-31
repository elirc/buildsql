# Reading - csharp/d21_deferred_execution

## Notes

The skill being drilled is knowing *when* a query runs. `Where`, `Select`,
`Take`, `SelectMany` and their relatives do not compute anything when you call
them; they build an object that knows how to compute something later. The
computation happens when somebody enumerates that object - once per
enumeration, from the beginning, every time.

The pattern uniting these eight problems is that **the query holds references,
not values**. It holds a reference to the source sequence, so a change to the
source is visible next time. It holds the lambdas, so a variable one of them
captured is read again next time. Nothing was copied, so nothing is frozen -
and `ToList` is the one word that says "freeze this now", which is why it turns
up as the fix to about half the problems here.

Everything else follows from counting. How many times is the source
enumerated? How many times does each lambda run? Once you are in the habit of
asking, multiple enumeration stops being a mysterious performance note and
becomes something you can see in the code: two LINQ calls over the same
`IEnumerable` parameter is two passes, and over a network reader or a `yield`
method with a side effect, two passes is a bug rather than a slowdown.

## ex1

Really testing: the difference between an `IEnumerable<T>` returned from a
query and a `List<T>`. The query re-runs from scratch on each enumeration, so
it sees the `Add` that happened after it was written - which looks like magic
until you notice nothing had been computed yet. The classic mistake is
returning a deferred query from a method whose caller expects a value; the
caller then enumerates it three times and pays three times, or enumerates it
after the underlying data has changed and gets an answer nobody asked for. As a
rule of thumb: a method that returns a *result* should return a `List<T>` or an
array, and a method that returns a *query* should say so in its name.

## ex2

Really testing: multiple enumeration, counted. Two operators over the same
sequence are two passes, and each pass re-runs every lambda in the chain - so
the supplied version calls the predicate ten times for five items. Over an
array that is a rounding error; over a database query or a file it is two
round trips, and over a sequence with side effects it is wrong rather than
slow. The fix here is not a cleverer query - it is a `foreach` that accumulates
both answers at once, which is also the most readable thing on the page. LINQ
is not always the answer, and knowing when to leave it is part of knowing it.

## ex3

Really testing: what a lambda captures, combined with when it runs. The lambda
captured the `Threshold` *object*, and the query reads `Value` off it at
enumeration time - so mutating the object rewrites a query that was written
before the mutation. Copying the value into a local first is what freezes it,
because the lambda then captures a local nobody else has a reference to. This
is the same mechanism as the famous captured-loop-variable bug, seen from the
other side, and it is a genuinely useful technique when you *want* it: a query
whose parameters can be tuned between runs.

## ex4

Really testing: sources that can only be read once, which is what makes
multiple enumeration a correctness problem rather than a performance one. A
network stream, a `DataReader`, a `yield` method reading a file - all of them
behave like this, and none of them announce it in their type. `Count()`,
`First()` and `Last()` each start a fresh enumeration, so the tidy-looking
three-line version throws on the second call. Materialising once with `ToList`
is the whole fix, and the general rule follows: if you are handed an
`IEnumerable<T>` and need to look at it more than once, copy it first - or take
an `IReadOnlyList<T>` in the signature and make the caller do it.

## ex5

Really testing: which operators stream and which buffer. `Where`, `Select`,
`Take` and `TakeWhile` process one item at a time and can stop early, so a
pipeline made only of those reads exactly as far as it must - four items to
find two even numbers. `OrderBy`, `GroupBy`, `Reverse` and `ToList` are
buffering: they cannot yield their first item until they have seen the last
one. That is not an implementation detail to be optimised away; it is forced by
what they mean. The practical consequence is that a `Take(10)` after an
`OrderBy` still reads everything, and the surprise in the other direction is
`Take(0)`, which never asks the source for a first item at all.

## ex6

Really testing: counting how many times a selector runs. The two-pass version
looks perfectly idiomatic - `Min` then `First` - and calls the cost function
about twice per item, which is invisible until the cost is a database lookup or
a hash. Carrying the best item *and* its cost through a single loop is the fix,
and `MinBy` is the operator that does it for you (it evaluates the selector
once per element). The other detail is the tie: a strict `<` keeps the first of
two equal costs, `<=` keeps the last, and neither is wrong as long as it was a
decision.

## ex7

Really testing: everything above, turned into a reusable tool. `Memoized<T>`
has to be lazy - building it reads nothing - and it has to cache, so a second
enumeration replays from the list rather than the source. The interesting part
is that both enumerators share one cache and one source cursor, which is what
lets the interleaved case work: the second enumerator's first item is already
in the list. Real libraries ship this - `System.Interactive`'s `Memoize` is
the same idea - and the reason to write it once yourself is that it forces you
to say exactly what "enumerate at most once" means. Note that it deliberately
does not handle two threads; making it thread-safe is a different exercise and
a much longer one.

## ex8

Really testing: composing several answers out of one reading. Each of the three
figures is a one-liner in LINQ and all three together are three passes, which
the one-shot source turns from wasteful into impossible. Writing the loop by
hand is not a defeat: the loop states plainly that these three numbers are over
the same rows, which is exactly the property that gets lost when a report grows
by one query at a time. The distinct-words requirement is the small lesson
inside the big one - a `HashSet` answers "is this new" in constant time and a
`List` remembers the order, and using both together is what `Distinct` does
internally anyway.

## Further reading

- [Deferred execution and lazy evaluation](https://learn.microsoft.com/en-us/dotnet/standard/linq/deferred-execution-lazy-evaluation) - the concept, with the classic example.
- [Classification of standard query operators by manner of execution](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/#classification-table) - which operators are deferred, streaming or buffering.
- [CA1851: possible multiple enumerations of an IEnumerable collection](https://learn.microsoft.com/en-us/dotnet/fundamentals/code-analysis/quality-rules/ca1851) - the analyser that catches ex2 and ex4 for you.
- [`Enumerable.MinBy`](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.minby) - the operator ex6 is asking you to hand-roll.
- [Lambda expressions and capture](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions) - what a closure actually holds.
- [`IEnumerable<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.ienumerable-1) - and the fact that nothing in its contract promises a second enumeration will work.
