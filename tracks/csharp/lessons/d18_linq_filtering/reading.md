# Reading - csharp/d18_linq_filtering

## Notes

The skill being drilled is choosing the right operator rather than writing a
loop that does the same thing more slowly. Every one of these eight problems
could be a `foreach` with an `if` in it; the reason to reach for LINQ is that
the operator names say what you meant, and a reader can check the intent
without simulating the code.

The pattern uniting them is the **pipeline**: restrict, then order, then cut,
then project - in that order. Almost every mistake in this set is an order
mistake. Taking before ordering gives an arbitrary top-N. Paging before
counting gives a total that is always the page size. Projecting before
filtering throws away the fields the filter needed. Once the shape is a habit,
the individual operators are trivia you can look up.

The other running theme is what each operator does with **nothing**: an empty
sequence, no match, a null element. `Any` says false and `All` says true;
`First` throws and `FirstOrDefault` does not; `Skip` past the end is empty
rather than an error. Those answers are not arbitrary, and knowing them is most
of what separates code that works on the happy path from code that works.

## ex1

Really testing: `Where` then `Select`, and the fact that neither one reorders
anything. The classic mistake is projecting first and filtering second - here
that still works because the length survives the upper-casing, but as soon as
the projection drops a field the filter needed, it does not. The second thing
being drilled is the `Select` overload whose lambda takes an index, which
removes the last honest reason to keep a manual counter beside a query. Note
that the index is the position in the sequence `Select` received, so putting a
`Where` in front of it renumbers everything.

## ex2

Really testing: the empty-sequence answers, which are the whole exercise.
`Any()` on an empty sequence is false and `All(...)` is true - vacuous truth,
the same rule that makes "every unicorn in this room is purple" true. It bites
in real code: a validation written as `orders.All(o => o.Total > 0)` passes
loudly for a customer with no orders. The other habit worth forming is `Any()`
over `Count() != 0`: `Any` stops at the first element, while `Count` walks the
entire sequence to answer a question the first element settled - and over a
lazy or remote source that difference is not a micro-optimisation.

## ex3

Really testing: four ways to fail, and picking the one that says what you mean.
`First` throws because for a sequence of ints there is no "no answer" value to
return; `FirstOrDefault` returns `default(T)`, which is null for a string and
*zero* for an int - a trap worth remembering, because zero is a perfectly
plausible value. `Single` is the interesting one: it is a claim that exactly
one thing matches, and it throws when two do. The classic mistake is using
`First` where `Single` was meant, which turns a broken assumption into a
silently arbitrary answer, and the second is using `Single` on a hot path,
since it must look at a second element to know it is alone.

## ex4

Really testing: the difference between filtering and slicing. `Where` looks at
every element; `TakeWhile` stops at the first failure and never looks again,
which is why `WithinBudget` refuses a cheap item that comes after an expensive
one. That is either exactly what you want or exactly what you did not,
and the operator name is the only thing that says which. `SkipWhile` is the
mirror: once it starts yielding it never tests again, so later negatives
survive. The paging arithmetic is the classic off-by-one - page 1 must skip
zero - and the pleasant surprise is that no bounds checking is needed anywhere,
because both `Skip` and `Take` are already total.

## ex5

Really testing: what "distinct" and "ordered" actually promise. `Distinct`
keeps the first occurrence and preserves order; it does not sort, and a result
that comes out sorted is a coincidence of the input. `DistinctBy` compares a
key and keeps the whole first item that had it, which is the operator people
hand-roll with a `HashSet` most often. The ordering half is about stability:
LINQ's `OrderBy` is a stable sort, so equal elements keep their relative input
order - but relying on that instead of writing the `ThenBy` means your tie-break
is an accident of the input rather than a decision, and `List.Sort` does not
make the same promise.

## ex6

Really testing: narrowing by type, and the difference between `OfType` and
`Cast`. `OfType<int>` filters - anything that is not an int is dropped, nulls
included. `Cast<int>` asserts - the first item that is not an int throws an
`InvalidCastException`. Using `Cast` where you meant `OfType` produces a crash
on data you thought you had excluded. In `Describe`, the ordering of the switch
arms is the lesson: `null` has to be handled first, because a type pattern
never matches null and the discard arm would then call `GetType()` on it. And
`Describe` projects rather than filters, so its output has exactly as many
entries as its input - a distinction the gate checks explicitly.

## ex7

Really testing: the pipeline order, under enough pressure that guessing does
not survive. Two independent filters, a two-level ordering, a limit, and a
projection - and the only arrangement that is correct puts `Take` after the
`OrderByDescending`/`ThenBy` pair and the `Select` last. Take first and you
get an arbitrary two rows sorted; project first and the revenue you need to
sort by is gone. The tie between two sales at 300 is deliberate: without the
`ThenBy` the result depends on input order, which is the kind of test that
passes today and fails when somebody adds a row. Note also that `HashSet`
membership is what keeps the region filter O(1) per row rather than a scan.

## ex8

Really testing: building a query conditionally, which is how every real search
endpoint works. Because the operators return a new `IEnumerable<T>` rather than
mutating, you can reassign a local inside an `if` and the query grows one clause
at a time - and nothing has run yet, so the cost of the branches is nothing. A
null criterion means *skip the filter*, not *match null*, and getting that
backwards makes an unfiltered search return zero rows. The second half is the
count: `TotalMatches` has to be taken after filtering and before paging, which
is exactly why the reference materialises the ordered sequence once and reads
both the page and the count off that list. Running two queries - one to count,
one to page - walks the source twice, which is wasteful over an array and
outright wrong over a sequence you can only read once.

## Further reading

- [LINQ overview](https://learn.microsoft.com/en-us/dotnet/csharp/linq/) - the standard query operators as a whole.
- [Filtering data](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/filtering-data) - `Where` and `OfType`.
- [Quantifier operations](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/quantifier-operations) - `Any`, `All` and `Contains`, including the empty-sequence rules.
- [Partitioning data](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/partitioning-data) - `Skip`, `Take`, `SkipWhile`, `TakeWhile`, `Chunk`.
- [`Enumerable.Single`](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.single) - and exactly when it throws.
- [Sorting data](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/sorting-data) - `OrderBy`, `ThenBy`, and the stability guarantee.
