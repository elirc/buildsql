# Reading - csharp/d15_iterators_yield

## Notes

An iterator method is a description of a sequence, compiled into a state
machine that runs one slice of the body per `MoveNext`. Everything in this set
follows from that single fact: calling the method runs nothing (ex2, ex8),
argument checks are postponed with the rest of the body (ex5), infinite loops
are harmless until someone demands everything (ex3), and abandoning a loop
midway simply never runs the remainder (ex8). The other skill drilled here is
the manual enumerator - `GetEnumerator`/`MoveNext`/`Current` inside a `using`
- which is what you need the moment two sequences must advance at different
rates (ex6, ex7). Write each iterator, then predict what the gate's counting
source will report before running it.

## ex1

Really testing: the basic shape - a loop around `yield return`, and the empty
case falling out naturally. `UpTo(7, 3)` is empty because the loop condition
is false immediately; no guard, no exception, no special case. The classic
mistake is building and returning a `List<int>`, which passes THIS gate but
is the habit the rest of the set will punish. Notice also that `Repeat` with
a negative count needs no check: a `for` loop that never starts is the check.

## ex2

Really testing: that transformation iterators do their work per-pull. Two
`yield return` statements inside one `foreach` is all `Stutter` is; the gate's
counting source proves nothing was read at call time and that `Take(3)` read
only two source items. The classic mistake is materialising (`Select` +
`ToList`, or filling a list) which produces identical output and fails the
pull-count asserts. `Numbered`'s counter is just a local - iterator locals
live in the state machine, so it survives between pulls.

## ex3

Really testing: that an infinite sequence is a legitimate value. `while
(true)` around a `foreach`, or a `for` with no condition, is safe because the
CALLER decides how much to consume - `Take(7)`, `First(...)`. Two classic
mistakes: trying to materialise (anything that walks to the end hangs), and
forgetting the empty-list guard in `Cycle` - cycling nothing must yield
nothing, not spin forever producing nothing, so check `Count == 0` and
`yield break` before entering the infinite loop.

## ex4

Really testing: single-pass thinking. The tempting implementation -
`values.Zip(values.Skip(1))` - enumerates the source TWICE, and the gate's
walk counter says so. The model answer keeps `previous` in a local, skipping
the yield on the first item: one `foreach`, one walk. This matters beyond
style: an `IEnumerable` might be a file, a network stream, or a query that
re-executes - walking twice is at best double cost and at worst different
data. `Deltas` is the same skeleton yielding `value - previous`.

## ex5

Really testing: the eager-validation split, one of the two famous iterator
traps. Because the whole body is postponed, a `throw` at the top of an
iterator does not fire at the call site - it fires later, wherever the
sequence is first enumerated, which may be another method entirely. The fix:
a public method with NO yield that validates and returns the result of a
private iterator method that does the work. The classic mistake is either
skipping the check or putting it inside the iterator and wondering why
`Teach.Throws` reports "no exception was thrown".

## ex6

Really testing: manual enumerators. Two `foreach` loops run one after the
other; interleaving needs both enumerators open at once, advanced
alternately. The shape to internalise: `using` on each enumerator (they may
hold resources), one `hasX = MoveNext()` before the loop, and after each
yield advance ONLY the side you consumed. The classic mistake is calling
`MoveNext` twice per turn - it advances, it does not peek - which silently
drops every other item.

## ex7

Really testing: the merge step of merge sort, written lazily. The invariant:
at every moment each side's `Current` is its smallest unconsumed value, so
yield the smaller and advance that side only. `<=` rather than `<` keeps the
merge stable and handles duplicates. The tail loops drain whichever side
remains. The classic mistake is buffering (`ToList` both, then sort or walk)
- correct output, but the gate's pull meters show everything was read to
produce three items. Real use: merging two sorted database cursors without
loading either.

## ex8

Really testing: the execution model, precisely. `MoveNext` runs from where
the body last paused to the NEXT `yield return`; the first call runs the code
before the first yield ("start"); the final call - the one that returns false
- runs the code after the last yield ("end"). Breaking out of a `foreach`
disposes the enumerator and the un-run remainder never happens, which is why
"middle" is missing in the abandoned run. The classic mistake is thinking of
an iterator as a method that ran and returned a collection; this exercise
exists to replace that model with slices-on-demand. Interviewers probe
exactly this with "what prints, and when?".

## Further reading

- [Iterators (C# guide)](https://learn.microsoft.com/en-us/dotnet/csharp/iterators) - yield, state machines, and the deferred body.
- [yield statement](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/yield) - the language reference, including the validation-split pattern.
- [IEnumerator&lt;T&gt;](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.ienumerator-1) - MoveNext/Current, what ex6 and ex7 drive by hand.
- [CA1851: possible multiple enumeration](https://learn.microsoft.com/en-us/dotnet/fundamentals/code-analysis/quality-rules/ca1851) - the analyser behind ex4's one-walk rule.
