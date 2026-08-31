# Reading - 96_drills_topn_1

Eight drills on picking the best few rows - globally with `ORDER BY` and
`LIMIT`, per group with a ranking window function. Read after your attempt,
pass or fail.

## Notes

There are exactly two top-N shapes and the whole set is built from them. The
global shape is a sort with a limit: one sort, one cut, and the database can
stop early if an index supplies the order. The per-group shape cannot use
`LIMIT` at all, because `LIMIT` cuts the result set once and you need it cut
once per partition - so you number the rows inside each partition with
`row_number()`, `rank()`, or `dense_rank()`, and then filter on that number
from an outer query or CTE, because a window function may not appear in the
`WHERE` of the level that computes it. Choosing between the three ranking
functions is choosing what to do about ties: `row_number()` breaks them
arbitrarily and always returns exactly N rows, `rank()` keeps ties together
and then skips numbers, `dense_rank()` keeps ties together without skipping,
which is what "the top two price levels" means. And whichever you choose,
put a tie-break in the window's `ORDER BY`, or the result is only
reproducible by luck.

## ex1 - the ten cheapest groceries

What it tests: that the global case stays simple. There is no window
function here and there should not be one - a sort and a `LIMIT` express the
whole question, and on an indexed column PostgreSQL can answer it with a
top-N heapsort instead of sorting 1,678 rows. The classic mistake is
reaching for `row_number()` because the lesson was about windows; the
reference deliberately shows that version so you can see it is the same
answer with more machinery. The model reasoning: one group means one cut,
and `LIMIT` is the cut.

## ex2 - the newest customer in each country

What it tests: the canonical per-group top-1. Twelve countries, twelve rows,
and the shape is always the same - number the rows inside the partition,
then keep number 1 outside. The classic mistake is `GROUP BY country` with
`max(created_at)`, which gives you the winning *timestamp* but no way to
carry `id` and `name` along; grouping collapses the row that held the
answer. The model answer keeps whole rows and just labels them, which is the
reason window functions exist.

## ex3 - three biggest orders per status

What it tests: top-N per group with N greater than one, and the discipline
of an output order that matches the ranking. The classic mistake is
filtering `rn <= 3` in the same `SELECT` that defines `rn`; PostgreSQL
rejects it, because `WHERE` runs before window functions are evaluated. The
model answer wraps the numbering in a CTE and filters outside. Note how the
outer `ORDER BY` repeats the partition key first - without that, the four
status blocks could interleave.

## ex4 - the two top price levels per category

What it tests: the difference between ranking rows and ranking values. With
`row_number()` you would get exactly two products per category and would
silently drop a product priced identically to the winner; `dense_rank()`
numbers the distinct prices, so ties arrive together and rank 2 is genuinely
"the second price level". The classic mistake is using `rank()` here and
wondering why nothing comes back at rank 2 when three products share the top
price - `rank()` would jump to 4. The model reasoning: the question is about
prices, so number the prices.

## ex5 - the two most reviewed products per category

What it tests: stacking an aggregate under a window. The count has to exist
before it can be ranked, so the query is two layers - group to one row per
product, then partition those rows by category. The classic mistake is
trying to do both in one level and hitting the rule that a window function
runs *after* aggregation: it can take `count(*)` as an argument (the
reference does exactly that), but it cannot be nested inside one. The model
answer uses a CTE per layer, which is the version you can still read in six
months.

## ex6 - the runner-up, not the winner

What it tests: that `row_number()` is a position, not a threshold - `rn = 2`
is as legal as `rn <= 2`, and "the second highest" is a genuinely common
report. The classic mistake is the pre-window folklore answer, `ORDER BY
price DESC LIMIT 1 OFFSET 1`, which gives the second highest overall rather
than per category, and gets slower with every row skipped. The model
reasoning: exactly one row per partition survives, so six categories give
six rows and no outer tie-break is needed.

## ex7 - each month's best day

What it tests: the full pipeline - aggregate to days, partition those days
by month, rank, keep one. The classic mistake is grouping by day and month
in one go and then assuming the biggest day per month can be found with
`max(revenue)`; you would get the value without the date again, the same
trap as ex2 one level up. The model answer computes `date_trunc('day', ...)`
and `date_trunc('month', ...)` in the same aggregate so the month key is
available for the partition without a second pass.

## ex8 - each country's busiest buyer

What it tests: join, aggregate, partition, rank - four steps that describe a
large share of real reporting queries. The classic mistake is the join
direction: an outer join from `customers` would drag the 5,003 customers
with zero orders into the ranking with a `count` of 1 (because `count(o.id)`
counts non-NULLs, but `count(*)` would not), so an inner join states the
intent plainly. The model reasoning: rank on the aggregate itself, and use
`customer_id` as the tie-break so the winner is stable when two customers of
one country tie.

## Further reading

- [Window Functions tutorial](https://www.postgresql.org/docs/16/tutorial-window.html) - partitions, ordering, and why a window function cannot be used in `WHERE`.
- [Window Function Processing](https://www.postgresql.org/docs/16/queries-window.html) - where windows sit in the evaluation order relative to `GROUP BY` and `WHERE`.
- [Window Functions reference](https://www.postgresql.org/docs/16/functions-window.html) - `row_number`, `rank`, `dense_rank`, `ntile` and their tie behaviour.
- [`SELECT` - `LIMIT` and `OFFSET`](https://www.postgresql.org/docs/16/queries-limit.html) - why `LIMIT` without `ORDER BY` returns an arbitrary subset.
- [Use The Index, Luke - Top-N queries](https://use-the-index-luke.com/sql/partial-results/top-n-queries) - how an index turns a top-N into an early-terminating scan.
