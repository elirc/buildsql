# Reading - csharp/11_linq_2

## Notes

**`GroupBy` is greedy in a way that matters.** It is a deferred operator — it
returns without doing anything — but the moment you enumerate it, it must read
the *entire* source before it can hand you the first group, because a later row
could belong to a group it has already yielded. So `GroupBy` buffers everything
in memory, which is fine for a list and worth knowing for a large stream. The
same is true of `OrderBy`, `Join` (it builds a lookup of the inner sequence),
and `Distinct` in its own way.

**`IGrouping<TKey, TElement>` is an `IEnumerable<TElement>` with a `Key`.** That
is the whole type. Everything you can do to a sequence — `Count`, `Sum`,
`OrderBy`, `Take` — you can do inside a group, which is what makes "top 3 per
category" a two-line LINQ query and a window function in SQL.

**Join builds a lookup.** `Join` and `GroupJoin` read the *inner* sequence into
a hash lookup first, then stream the outer sequence past it. So the cost is
roughly one pass over each, not the n × m a nested loop would give — the same
hash-join strategy a database planner picks. It also means the inner sequence is
fully materialised, which is another reason to pass the smaller side as the
inner one.

**Query syntax is a rewrite, not a runtime.** `from x in xs where ... select ...`
is turned into method calls by the compiler before anything else happens. There
is no performance difference and no operator available only in one form —
though the reverse is true: many operators (`Count`, `Take`, `Distinct`) have no
keyword and need a method call anyway, which is why most codebases lean on
method syntax and switch to query syntax for joins and multi-level groups.

**Anonymous types are the glue.** `new { customer.Name, sale.Amount }` creates
an unnamed class with two read-only properties, value equality and a sensible
`ToString` — records, essentially, before records existed. They exist for
precisely this: carrying a few values through the middle of a query without
declaring a type for them. They cannot leave the method (you have no name to
declare a return type with), which is a deliberate limit, not an oversight.

## ex1

The mental shift is that a group is a sequence. In SQL, after `GROUP BY
category` you cannot see individual sales any more — only aggregates. In LINQ
you can: `group.OrderByDescending(s => s.Amount).Take(3)` gives you the biggest
three sales *within* each category, which in SQL needs `ROW_NUMBER() OVER
(PARTITION BY ...)`. That extra power is the single biggest difference between
the two grouping models, and it is worth remembering when a report gets
awkward.

`ToDictionary(keySelector, valueSelector)` is the standard way to finish a
grouping when the caller wants lookups rather than a list. Two things to know:
it throws on duplicate keys (which is a feature — it catches a grouping mistake
immediately), and `ToLookup` is its sibling for when duplicates are expected,
returning a multi-value dictionary that never throws and returns an empty
sequence for a missing key.

The empty-source behaviour — no groups rather than one empty group — is the
same as SQL's, and it is the reason a "no data" report needs the explicit
decision that lesson 10's challenge made.

## ex2

`Join` is an inner join and `GroupJoin` is a left join, and if you take one
sentence from this lesson, take that one. The failure mode is asymmetric and
nasty: an inner join where you wanted a left join does not error, it just
silently returns fewer rows. Zed vanishes from the report, and nobody notices
until someone asks why the customer count is 3 when the CRM says 4.

The LINQ shape differs from SQL's in a way that is worth stating. SQL's `LEFT
JOIN` produces one row per match *with nulls* when there are none.
`GroupJoin` produces one row per outer item with a **group** of matches, which
is usually more useful — you can `Count()` it, `Sum()` it, or check whether it
is empty, all without a null in sight. When you genuinely want SQL's shape, the
idiom is `GroupJoin(...).SelectMany(g => g.Inner.DefaultIfEmpty(), ...)`, and
that is exactly what EF Core generates for a left join.

`DefaultIfEmpty` is worth meeting on its own: it turns an empty sequence into a
one-element sequence holding `default(T)`. That is the whole mechanism behind
LINQ's outer joins, and it is a neat trick to have in your pocket.

## ex3

`SelectMany` is the flattening operator and also, quietly, the join operator.
`from shipment in shipments from item in shipment.Items select ...` compiles to
`SelectMany` — a nested `from` **is** a join, and if the inner collection were
a whole other sequence rather than a child property, that is a cross join with
a filter.

Which explains the empty-shipment behaviour: shipment B contributes nothing
because flattening an empty collection contributes nothing, and that is the
same reason an inner join drops unmatched rows. Two facts, one mechanism.

The two-lambda overload exists because flattening loses the parent. Once the
items are in one flat sequence, "which shipment was this from?" is
unanswerable, so the pairing must happen *during* the flattening. Every time you
find yourself flattening and then trying to look the parent back up, that
overload is what you wanted.

`SelectMany` is also the reason LINQ is a monad, if you have met the word — it
is `bind`. You do not need the theory; you do need to recognise that "map, then
flatten" is one operation with a name.

## ex4

`Aggregate` is the fold, and its two overloads encode a real decision. The
seedless version starts from the first element and throws
`InvalidOperationException` on an empty sequence — correct, because "the longest
of nothing" has no answer. The seeded version (`Aggregate(seed, func)`) never
throws and returns the seed. Choosing between them is choosing whether empty is
an error or a legitimate base case, which is the same question `Max` answers by
throwing and `Sum` answers by returning 0.

Most `Aggregate` calls in the wild should have been something else — `Sum`,
`Max`, `string.Join`, or a `foreach`. It earns its place when the fold is
genuinely custom and the sequence is being consumed once. When you catch
yourself writing `Aggregate` to build a string, use `string.Join`: it is
clearer and it does not allocate a new string per element.

The query-syntax half is worth practising even though most code you write will
be method syntax. `group x by key into g` is the piece that has no obvious
method-syntax counterpart at a glance (it is `GroupBy` plus a continuation), and
`join x in xs on a equals b into g` is how a left join looks in keywords.
Reading a colleague's query-syntax `join ... into ... from ... in ...
DefaultIfEmpty()` without flinching is a genuine skill.

## challenge

Real reports are exactly this: two tables, a join, a grouping, an aggregate, a
ranking, and a formatting decision at the end. The interesting part is that the
*specification* decides the join type, and the specification here says "the
customers who spent the most" — which cannot include somebody who spent
nothing.

If the specification had said "every customer, with their spend", the same
report would need `GroupJoin` and would show `zed: 0`. Neither is more correct;
they answer different questions. The mistake to avoid is picking a join because
it is the one you remembered.

Grouping by name rather than by id is the other thing a reviewer would flag.
Two customers called "ada" would silently merge into one row, and the test data
cannot show you that. In production, group by the key that is actually unique
and carry the display name along for the projection.

## review1

`Where` after `GroupBy` is `HAVING`, and the reason SQL needs two keywords is
the reason this matters: a condition about a *group* cannot be expressed as a
condition about a *row*. "Its category has at least three sales" is not a fact
about any individual sale. Try to write it as a pre-grouping filter and you will
find there is nothing to write.

The order does matter for cost as well as meaning. Filtering rows before
grouping (a real `WHERE`) means fewer rows to group; filtering groups after
means you grouped everything first. When both are possible — "categories with
three or more sales over 100" — you want both: `Where` the rows, `GroupBy`, then
`Where` the groups. That is precisely how the SQL version reads too.

`group.Max(...)` versus `sales.Max(...)` is the same scope question as ex1's
`Count`. Inside a `Select` over groups, `group` is your world; reaching back out
to the whole sequence gives a number that is the same for every row, which is
occasionally what you want and usually a bug.

## Further reading

- [`GroupBy`](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.groupby) — every overload, including the element-selector and result-selector forms.
- [`Join` and `GroupJoin`](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/join-operations) — inner joins, group joins, and the left-outer-join idiom.
- [`SelectMany`](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/projection-operations#selectmany) — flattening, with the two-lambda overload explained.
- [`Aggregate`](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.aggregate) — the seeded and seedless versions and what each does with an empty sequence.
- [Query syntax versus method syntax](https://learn.microsoft.com/en-us/dotnet/csharp/linq/get-started/query-expression-basics) — the rewrite rules, keyword by keyword.
- [Grouping data](https://learn.microsoft.com/en-us/dotnet/csharp/linq/standard-query-operators/grouping-data) — worked examples including nested groupings.
