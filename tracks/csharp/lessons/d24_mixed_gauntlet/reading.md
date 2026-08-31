# Reading - csharp/d24_mixed_gauntlet

## Notes

This set does not drill a feature. It drills the thing that actually makes
someone useful in C#: reaching for the right two or three tools at once and
getting the seams between them right. Every exercise here is small, and every
one of them fails for a reason that lives in the join rather than in any single
part.

The pattern uniting them is **decide, then compose**. What is a row? What order
is it in? What does "equal" mean here? What happens to the item that does not
fit? Each exercise makes you answer one of those questions explicitly, because
the parts on their own have no opinion: `GroupBy` will not tell you what to do
about the empty team, `Dictionary` will not tell you whether a repeat is a
mistake, `Task.WhenAll` will not tell you whether one failure should hide five
successes.

If a problem here feels like guessing, that is information rather than failure:
each section in the README names the drill sets it came from, and rereading one
of those is a better use of ten minutes than staring at this one.

## ex1

Really testing: records and a two-level query in the same breath. The query is
the familiar filter-group-order-project, and the trap is where the filter goes:
filtering before grouping is what makes the all-negative team disappear
completely, because `GroupBy` never invents a group for a key nothing reached.
The record half is `with`, and the assertions are chosen to show what it means
- the copy is a different object and an equal one, because records compare by
value. That combination is the whole reason to model a domain value as a
record.

## ex2

Really testing: an interface used as a generic constraint, which is the point
where "interfaces are for polymorphism" and "generics are for reuse" turn out
to be the same sentence. `where T : IPriced` gets you `.Price` inside the
method while the caller keeps their own type on the way out - no casting and no
`object`. The dictionary half is a deliberate contrast with d19: there a
duplicate key was a broken assumption worth throwing over, and here it is an
intended overwrite - so the indexer, not `Add` and not `ToDictionary`. Which
one is right depends entirely on what a repeat *means*, and that is a decision
the API cannot make for you.

## ex3

Really testing: a hierarchy, a switch over it, and validation in the
constructor. Putting the guard in the constructor is what makes every `Rect`
that exists a valid one, so no method downstream has to check - the shortest
route to code with no defensive noise in it. The `switch` is a type pattern
with a discard arm, and the arm matters: a pattern switch over a hierarchy
somebody else can extend needs an answer for the subclass you have not seen.
The formatting detail is small and real - `ToString()` on a double uses the
current culture, so on a machine with a comma decimal separator the same code
prints `12,57` and every string comparison in your test suite fails.

## ex4

Really testing: behaviour stored in a dictionary, and the two different
failures a dispatcher can have. "No such command" is the caller asking for
something that does not exist; "the handler threw" is the command failing at
its job. Reporting both as the same exception type makes them
indistinguishable, and wrapping the second one - with the original as its
`InnerException` - is what keeps the distinction while losing nothing. The
other detail is `Names`: a `Dictionary` makes no promise about enumeration
order, so a separate list is what remembers registration order. Relying on the
order a dictionary happens to give you is a bug that waits for a rehash.

## ex5

Really testing: what "equal" means, and when the answer is computed. A custom
`IEqualityComparer<T>` has two halves and they must agree - two values that
compare equal have to produce the same hash code, or the `HashSet` puts them in
different buckets and never notices they are the same. That is not a style rule;
it is the contract the whole hashed-collection family is built on.
`FirstOfEach` then puts that comparer inside an iterator, so the distinctness is
decided lazily, one item at a time - which is why `Take(1)` reads one item
rather than all four.

## ex6

Really testing: a class that owns a collection, announces changes, and answers
questions about itself. The ordering inside `Add` is the interesting part -
validate, mutate, *then* raise - so a handler that reads `Count` sees the state
the event is telling it about, and a refused add announces nothing. An event
means something happened; raising one for something that did not is worse than
having no event at all. The two query methods are ordinary `GroupBy` work, and
the point of having them here is that a well-designed object answers questions
rather than handing out its list for somebody else to query.

## ex7

Really testing: fan-out where partial failure is the normal case. Both methods
have to start everything before waiting for anything - the gate counts the
fetches to make sure - and both have to treat one failure as a fact to report
rather than an end to the operation. `await Task.WhenAll` rethrowing only the
first failure is the mechanism that makes the naive version wrong, and reading
each task's own state afterwards is the fix. The ordering rule is the last
piece: results ordered by id rather than by who answered first, so the same
data produces the same output on every run.

## ex8

Really testing: everything at once, in the shape real code takes. The design
decision worth noticing is the pair of fields - a `Dictionary` for lookup by id
and a `List` for insertion order - because neither structure gives you both,
and every method has to keep them agreeing. `Remove` is where that goes wrong
most often: taking the entry out of the dictionary and leaving the id in the
order list gives a repository whose totals are right and whose queries are not,
which is exactly the assertion the gate ends on. The rest is the vocabulary of
the track - an event raised after the change, `KeyNotFoundException` rather
than null, a predicate parameter instead of a dozen `FindByX` methods, and a
grouped report formatted so it reads the same on every machine.

## Further reading

- [Records](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record) - `with`, value equality, and when to reach for one.
- [Generic constraints](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters) - what `where T : IPriced` buys you.
- [Pattern matching](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/pattern-matching) - type patterns, switch expressions and the discard arm.
- [`IEqualityComparer<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.iequalitycomparer-1) - and the Equals/GetHashCode contract.
- [Iterators](https://learn.microsoft.com/en-us/dotnet/csharp/iterators) - `yield return` and when the body runs.
- [Task-based asynchronous pattern](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap) - the conventions ex7 follows.
- [`CultureInfo.InvariantCulture`](https://learn.microsoft.com/en-us/dotnet/api/system.globalization.cultureinfo.invariantculture) - why machine-readable output should never use the current culture.
