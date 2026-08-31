# Reading - csharp/d19_linq_grouping

## Notes

The skill being drilled is turning a flat sequence into a summary. `GroupBy`
does one thing: it walks the sequence, computes a key for each item, and hands
back one `IGrouping<TKey, TElement>` per distinct key - a key with the items
that had it hanging off it. Everything else in this set is what you do with
those groups.

The pattern uniting the eight problems is **group, aggregate, order,
project**, in that order. The grouping decides what a row is; the aggregate
decides what the row says; the ordering is over the *rows*, not the original
items, which is the step people most often put in the wrong place. Sorting the
input and then grouping usually gives the right answer by accident and the
wrong one as soon as the data changes.

The other thing worth internalising is what `GroupBy` will never do for you: it
never invents a group for a key nothing had. That is exactly right for
"customers by city" and exactly wrong for a histogram, where a bucket with zero
in it is the most interesting bucket on the chart. Ex8 makes that concrete.

## ex1

Really testing: the shape of what `GroupBy` returns. A group is not a list -
it is an object with a `Key` that also happens to be an `IEnumerable` of its
items, which is why `group.ToList()` and `group.Count()` both work on it
directly. The classic mistake is reaching for a `Dictionary<char,
List<string>>` and a `foreach` with a `ContainsKey` check, which is what
`GroupBy` plus `ToDictionary` does in one line. Note that both the groups and
the items inside them come out in first-seen order - documented behaviour of
the LINQ-to-Objects implementation, and worth relying on only there.

## ex2

Really testing: aggregating within a group and then ordering the results. Each
group gets `Sum`, `Max` or its own inner `OrderBy`, and the outer ordering
operates on the aggregated rows. The interesting one is `BestSellerByRegion`,
where the answer is "the item with the largest X" rather than the largest X
itself - `Max` gives you the number and throws away the row, so you either sort
the group and take the first, or use `MaxBy`. Both south sales are 40 units on
purpose: without the explicit tie-break the result depends on input order, and
a test that passes for that reason is not a test.

## ex3

Really testing: the difference between a one-to-many index and a one-to-one
one. `ToLookup` gives an `ILookup`, which is immutable, allows duplicate keys,
and returns an *empty sequence* for a key it does not have - so there is never
a null check and never a `ContainsKey`. `ToDictionary` insists each key appears
once and throws `ArgumentException` when it does not. That exception is a
feature: an id that repeats means the assumption behind the index is false, and
finding out here is much cheaper than finding out three screens later. The
third method shows the middle road - `GroupBy` then `ToDictionary` with
`Count()` - for when you want one value per key but the source has many.

## ex4

Really testing: composite keys. A value tuple `(visit.Day, visit.Room)` works
as a group key because tuples get structural equality and a matching hash code
for free, and the same is true of an anonymous type or a record. The classic
mistake is `visit.Day + visit.Room`, which quietly collides whenever the pieces
can run together ("Mo" + "nA" and "Mon" + "A" are the same string). The second
half is about `Distinct` inside a group: bob's two identical visits are one
room, so counting rows instead of distinct rooms would call him a room-hopper
on the strength of a duplicate.

## ex5

Really testing: the three `Aggregate` overloads and how they differ at the
edges. The seedless one starts with the first element and therefore throws on
an empty sequence - which is right for "the deepest path" and wrong for "the
total". The seeded one returns the seed for an empty sequence, and its seed can
be a different type from the elements, which is what lets a fold build
something. The third adds a result selector, which is how you carry a working
state - here a four-part tuple - and convert it to the answer at the end.
`Summarise` in one pass rather than four separate `Min`/`Max`/`Sum`/`Count`
calls is the point: four calls walk the sequence four times, which is invisible
over an array and impossible over a stream.

## ex6

Really testing: that `GroupBy` has four overloads and most people know one.
The element selector changes what the group *contains* - names rather than
employees - which is usually what you wanted and saves a `Select` inside the
`Select`. The result selector goes further and means no `IGrouping` object is
allocated at all: your lambda receives the key and the members and returns the
finished row. Neither is a performance argument at this scale; both are
readability arguments, and knowing they exist is what stops the deeply nested
`Select(g => new { g.Key, Names = g.Select(e => e.Name) })` that everybody
writes first.

## ex7

Really testing: top-N per group, which is the query people most often get
wrong. The ordering has to happen *inside* each group - `group.OrderByDescending
(...).Take(2)` - because a global sort followed by a group-wide `Take` takes
two rows from the whole sequence, not two from each. Pulling the per-group
ranking into a small helper is what makes the second half short, and the second
half is the other lesson: `SelectMany` flattens the per-game winners back into
one sequence of names, which can then be grouped *again* by name. Group,
flatten, group is a shape worth recognising; it is the same one SQL expresses
with a window function.

## ex8

Really testing: two aggregates over the same group with different filters, and
the limit of `GroupBy`. `Count(entry => entry.Level == "error")` and
`Max(entry => entry.Millis)` read the same group and answer different
questions, which is why the group has to be projected into a row before it is
filtered and ordered - filtering the *entries* to errors first would give the
wrong "slowest". The histogram is the more important half: `GroupBy` produces
a group only for a key that occurred, so an empty bucket simply is not there.
The fix is to state the buckets yourself and look each one up, which turns
"what did the data contain" into "what does the report always show" - a
distinction worth making explicitly every time you draw a chart.

## Further reading

- [Grouping data](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/grouping-data) - every `GroupBy` overload, with examples.
- [`IGrouping<TKey, TElement>`](https://learn.microsoft.com/en-us/dotnet/api/system.linq.igrouping-2) - the key-plus-sequence type groups come back as.
- [`Enumerable.ToLookup`](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.tolookup) - and the empty-sequence-for-a-missing-key rule.
- [`Enumerable.ToDictionary`](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.todictionary) - including the duplicate-key exception.
- [Aggregation operations](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/aggregation-operations) - `Sum`, `Max`, `MaxBy`, `Average` and `Aggregate`.
- [`Enumerable.Aggregate`](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.aggregate) - the three overloads ex5 is built from.
