# Reading - csharp/d20_linq_joins_flatten

## Notes

The skill being drilled is relating two sequences to each other, and the whole
subject is easier once you notice that LINQ has exactly two primitives for it.
`Join` matches items by key and produces one row per matching *pair*.
`SelectMany` takes each item, asks for a sequence, and concatenates the
results. Everything else here - the left join, the cross product, the recursive
walk - is one of those two wearing a hat.

The pattern uniting the eight problems is **what happens to the rows with no
partner**. An inner join drops them silently, which is right when a missing
partner is impossible and a disaster when it is merely rare. `GroupJoin` keeps
every outer item and hands you a possibly-empty group, which is the left join,
and `DefaultIfEmpty` is what turns that empty group into a visible row. The
invoice with no lines and the customer with no orders are the same problem in
two costumes, and both vanish from a naive flatten.

The third thread is order. `Join` yields the outer sequence's order; `Zip` runs
in lockstep and stops at the shorter side; `SelectMany` puts the outer item's
whole inner sequence out before moving on. None of these sorts anything, so
every ordering in this set is one you have to ask for - and every tie the gate
builds is there because a result that depends on input order is not a result.

## ex1

Really testing: reading `Join`'s four arguments. Outer sequence, outer key,
inner key, result selector - and the two key selectors have to return the same
type, which is the compiler's one contribution to getting this right. The
classic mistake is putting the sequences in the wrong order and then wondering
why the output is ordered strangely; the outer sequence is the one you call the
method on, and it drives both the order and the row count. The order for
customer 9 is the real lesson: it disappears with no exception, no warning and
no trace, and the only way to know is to have counted first.

## ex2

Really testing: that a left join in LINQ is two operators, not one. `GroupJoin`
is the left join in spirit - every outer item gets a row, with a group of
matches that may be empty. `SelectMany` with `DefaultIfEmpty` flattens it back
to one row per pair, using one null row where the group was empty, which is
exactly what SQL's `LEFT JOIN` produces. The classic mistake is forgetting the
`DefaultIfEmpty` and quietly getting an inner join back. Note also which side
is privileged: the orphaned order in this data is still not reported by any of
the three methods, because a left join is one-sided by definition - `Except`
in both directions is how you find the orphans on both sides.

## ex3

Really testing: `SelectMany` as concatenation. The one-argument form is the
whole operator - hand it a selector that returns a sequence and it strings the
results together - and `Flatten.All` shows it at its most naked, with the
selector being the identity. That a `string` is an `IEnumerable<char>` is worth
noticing on its own; it makes `words.SelectMany(word => word)` legal and is why
several string methods surprise people. The cross product is the same operator
with a selector that ignores its input, and the nesting order falls out of that:
the outer item's whole inner sequence is produced before the next outer item,
exactly like two nested `foreach` loops.

## ex4

Really testing: the two-lambda `SelectMany`, which exists precisely because the
one-lambda form loses the parent. Once you have flattened to lines, the invoice
number is gone; the result-selector overload hands you both, so `"INV1/paper"`
is one call rather than a projection to a tuple and a second `Select`. The
numbering is the sharper half: the index has to come from a `Select` on the
inner list, because an index over the flattened sequence would number `glue` as
3 rather than 1. And `Blank` is here to make the disappearing act explicit -
`INV2` contributes zero rows to the flatten, and reporting it needs a separate,
unflattened pass.

## ex5

Really testing: five operators that all combine two sequences and differ in
ways that are easy to get wrong under time pressure. `Zip` is positional, not
key-based, and it truncates rather than throwing - which makes it excellent for
paired data and dangerous for data you assumed was paired. `Intersect`,
`Except` and `Union` are set operations: they de-duplicate, they use the
default equality comparer, and `Except` is one-sided. `Concat` is the only one
that preserves duplicates, and reaching for `Union` when you meant `Concat` is
a bug that removes real rows and looks like nothing happened.

## ex6

Really testing: composite join keys. `(booking.Day, booking.Room)` works as a
key because value tuples have structural equality and a consistent hash code,
so the two key selectors just have to produce tuples of the same shape. The
alternative people reach for - concatenating the strings - collides whenever
the pieces can run together, and worse, it turns a type error into a silent
data error. The other lesson is the multiplication: two shifts cover Mon/A, so
each Mon/A booking produces two rows. A join is not a lookup, and if you wanted
one row per booking, that is a `GroupJoin` and a decision about which nurse.

## ex7

Really testing: chaining joins, and reading a specification carefully enough to
notice which sequences a query consults. `Transcript` joins through students
and courses, so an enrolment missing either partner vanishes. `CourseAverages`
joins only through courses - so the enrolment belonging to the non-existent
student 9 *is* counted, because nothing in that query ever looks at students.
That is not a trick; it is the most common real bug in report code, where two
numbers on the same page are computed over subtly different populations and
nobody notices until they are challenged to explain why they do not add up.
The integer division is a smaller version of the same care: `Sum / Count`
truncates, and that is a decision, not an accident.

## ex8

Really testing: recursion, expressed with `SelectMany`. A tree is the case
where you genuinely cannot write the query with a fixed number of joins,
because you do not know how deep it goes - so the flattening operator calls the
method that calls the flattening operator. `Paths` also demonstrates the
accumulator: the prefix is passed *down* the recursion, which is what lets each
node build its own path in constant work instead of walking back to the root.
The base cases are where the bugs are: a leaf is a node with no children, which
means a lone root is its own leaf and one level deep - and `Max` over an empty
child list would throw, which is why the leaf case is checked before the
recursion rather than inside it.

## Further reading

- [Join operations](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/join-operations) - `Join` and `GroupJoin`, with the left-join recipe.
- [`Enumerable.SelectMany`](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.selectmany) - all four overloads, including the one that keeps the parent.
- [Projection operations](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/projection-operations) - `Select`, `SelectMany` and `Zip` side by side.
- [Set operations](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/set-operations) - `Distinct`, `Union`, `Intersect`, `Except` and the `...By` variants.
- [`Enumerable.DefaultIfEmpty`](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.defaultifempty) - the one call that turns an empty group into a row.
- [Value tuples](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-tuples) - and why they work as dictionary and join keys.
