# Reading - 111_drills_reports_3

The hardest of the three report sets. Read after your attempt, pass or
fail.

## Notes

Two disciplines separate this set from the previous two. First, *relative
anchors*: reports that say "yesterday" or "the cheapest shelf first" cannot
hard-code what they mean - they derive it from the data (`max(ts)`,
`min(price)`) so the query stays true as the data moves. Second, *decision
math versus display math*: several exercises round a number for the reader
while filtering or sorting on its unrounded value, and keeping those two
uses separate is the difference between a report that is stable and one
whose bottom edge flickers. The finale is a genuine interview staple - the
co-occurrence (basket) query - whose two traps, double-counted pairs and
join-row inflation, are both worth failing once here where it is cheap.

## ex1

A relative time window with a one-row answer. What it tested: anchoring
"yesterday" on `date_trunc('day', max(ts))` and taking the day *before* it,
because the stream's final day is partial and would understate everything.
The classic mistake is anchoring on `now()` - this dataset's clock stopped
in 2023, and a wall-clock anchor returns zeros that get blamed on the
database rather than the query. Three aggregates share the filtered pass.

## ex2

A two-cell pivot over a three-table join. What it tested: keeping each
filter at its own grain - month on the order, category on the product,
money on the line - and lesson 17's FILTER doing the split. The classic
mistake is joining and then summing `oi.price` alone (forgetting quantity),
or filtering the month on the line's implicit date, which does not exist -
line items have no timestamp, and noticing that *is* the exercise.

## ex3

CASE buckets with a semantic sort. Alphabetical band order is nonsense to a
reader, and the fix - `ORDER BY min(price)` - sorts groups by an aggregate
that never appears in the output, which many people do not know is legal.
What it tested: exact label discipline (the gate compares strings) and that
ordering trick. The classic mistake is a second CASE in ORDER BY that
drifts out of sync with the first when a band edge changes; deriving the
order from the data cannot drift.

## ex4

A window average as a per-row benchmark, then a filter on it - which
forces the CTE wrap, because WHERE cannot see window results (lesson 15's
rule resurfacing under HR's clothing). What it tested: that wrap, plus
qualifying and sorting on unrounded values while displaying rounded ones.
The classic mistake is filtering `below_pct >= 20` after rounding: someone
at 19.96 rounds to 20.0 and appears - or disappears - depending on which
value you compared. Decide on the truth, display the summary.

## ex5

One per-product revenue CTE asked two questions: who is biggest per
category, and how big is the category. The pick is lesson 49's DISTINCT ON
(or `row_number() = 1`); the denominator is either a second grouped pass
joined back or a window `sum() OVER (PARTITION BY category)` riding the
same scan - the reference does both jobs in one window pass. The classic
mistake is computing the share against *overall* revenue instead of the
category's, which makes every flagship look tiny and the report pointless.

## ex6

Consecutive-row arithmetic at scale: lag() partitioned per customer,
date-cast subtraction, then an average over the gaps - two stages, since
window output cannot feed an aggregate in the same query. The elegant
check hidden in the reference: gaps telescope, so the global average gap
is `sum(last - first) / sum(n - 1)` over multi-order customers, no window
at all. If the two spellings disagree, the window version's partition
leaked across customers. Knowing a second derivation of your own number is
the cheapest audit there is.

## ex7

A ratio with a distinct-count denominator and a volume floor. What it
tested: `count(DISTINCT customer_id)` doing double duty in the SELECT and
the HAVING, and understanding *why* the floor exists - a three-buyer
country can top any per-buyer ranking on luck alone, and the requester
preemptively declined that conversation. The classic mistake is dividing
by `count(*)` (orders, not buyers), which deflates exactly the countries
with loyal repeat customers - the opposite of the question.

## ex8

The basket query. Two independent dedupes must both happen: each unordered
category pair counted once per order (`p1.category < p2.category`), and
each order counted once per pair no matter how many line combinations
produce it (`count(DISTINCT order_id)`). Miss the first and every pair
appears twice, mirrored; miss the second and multi-line orders inflate
their pairs quadratically - both bugs produce plausible-looking leader
boards, which is what makes this an interview favourite. The reference
reduces first (DISTINCT order-category pairs in a CTE) and then counts
plainly - the shape that scales, and the one to remember.

## Further reading

- [Window Functions](https://www.postgresql.org/docs/16/tutorial-window.html) - partitioned lag() and running benchmarks.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - FILTER, distinct aggregates, and aggregates in ORDER BY.
- [Date/Time Functions and Operators](https://www.postgresql.org/docs/16/functions-datetime.html) - date_trunc anchoring and interval arithmetic.
- [Self-Joins (PostgreSQL wiki examples)](https://wiki.postgresql.org/wiki/SQL_scripts) - co-occurrence and pairing patterns over a single table.
