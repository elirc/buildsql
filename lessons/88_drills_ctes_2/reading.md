# Reading - 88_drills_ctes_2

Eight refactoring drills: the same answer written as named steps and as
something else. Read after your attempt, pass or fail.

## Notes

Every query in this set has at least two correct spellings, and the choice
between them is an engineering decision rather than a matter of taste. Three
rules of thumb come out of the eight problems. First, when a value is needed
in more than one place - a threshold, a grand total, a company average - name
it once; a CTE referenced twice is materialised and computed once, whereas the
same subquery pasted twice is computed twice, and the two copies can silently
drift apart during maintenance. Second, when a query needs an aggregate at one
grain and a detail row at another, a CTE per grain reads better than nested
parentheses, and it is the only version anyone will be able to modify in a
year. Third, when the refactor changes which rows survive - an inner join
where a `LEFT JOIN` was needed, an `EXCEPT` that also removes duplicates - the
two spellings are no longer equivalent and the rewrite is a bug. `EXCEPT` in
exercise 4 is the standing example: it deduplicates, where `EXCEPT ALL` does
not, and `NOT EXISTS` neither deduplicates nor sorts. All three give the same
answer only because the sets involved happen to be distinct already.

## ex1 - a correlated subquery, unrolled

The correlated version asks for a category average once per product row; the
CTE version computes six averages and hash-joins them onto ten thousand rows.
Same answer, a different order of magnitude of work, and the CTE version says
plainly that there are exactly six numbers involved. The classic mistake is
computing the averages *after* applying the `IN ('books', 'electronics')`
filter, which is a different query - the prompt is explicit that the averages
cover the whole category, and here they would be identical anyway, which is
exactly the kind of coincidence that hides the bug until the data changes.

## ex2 - the constant that must not be recomputed

`CROSS JOIN` against a one-row CTE attaches a constant to every row, but the
constant then has to survive the `GROUP BY` - and PostgreSQL does not know
that `v.avg_total` has only one value, so it must be either grouped or
aggregated. Wrapping it in `min()` is the idiomatic dodge. The classic mistake
is writing `avg(o.total) - v.avg_total` and being told the column "must appear
in the GROUP BY clause"; the reference's scalar-subquery spelling side-steps
the whole issue because a subquery is not a column.

## ex3 - aggregate, enrich, aggregate

Two aggregations at two different grains with an enrichment in between - the
single most common shape in analytics. Note that `buyers` counts rows of the
per-customer CTE, so it is customers-with-orders and not customers; getting
the never-ordered ones in as zeros would need a `LEFT JOIN` from `customers`
and a `count(...)` of the order side instead. The classic mistake is joining
`customers` to raw `orders` and taking `count(DISTINCT customer_id)` -
correct, but it counts distinct values across half a million rows where the
staged version counts 45,000.

## ex4 - two named sets, one difference

`EXCEPT` is set subtraction with implicit deduplication, which is why the two
CTEs can be written with or without `DISTINCT` and give the same answer. The
useful property is that it reads exactly like the sentence in the prompt.
Its cost is a sort or a hash of both sides; the reference's `NOT EXISTS`
spelling becomes a hash anti join and is usually the faster plan, but needs
`DISTINCT` added by hand because a product with eighty reviews would otherwise
appear eighty times.

## ex5 - last month, without a window function

Joining a CTE to itself on a shifted key is how "compare to the previous
period" was written before window functions, and it still has one advantage:
the shift is explicit, so a month with no orders at all leaves a genuine
`NULL` rather than silently pairing with whatever row happened to be
previous. `lag()`, shown in the reference, looks at the preceding **row** of
the ordered window, which is the same thing only when the series has no gaps.
The classic mistake is an inner join, which drops the first month.

## ex6 - a CTE made of literals

`WITH tiers(tier, lo, hi) AS (VALUES ...)` builds a table out of nothing,
which is the cleanest way to hold band definitions, mapping tables and test
fixtures inside a single statement. The `LEFT JOIN` matters: a band that
matched no product would still appear, with `count(p.id) = 0`, where
`count(*)` would wrongly report 1. The `CASE` spelling in the reference
cannot produce an empty band at all, which is the real difference between the
two and the reason the `VALUES` form is worth knowing.

## ex7 - one CTE, two consumers

`company` is read by the `above` CTE and by the final `SELECT`, so it is
computed once and reused - the diamond again, with the twist that one consumer
uses `avg_salary` and the other uses `payroll`. The `LEFT JOIN` plus
`coalesce(..., 0)` is what turns "no matching row" into the zero the prompt
asks for; without it a department where nobody beats the company average would
report `NULL`, which is a different claim. The reference's `FILTER` spelling
gets the zero for free, because an aggregate over no rows still produces a row
in its group.

## ex8 - a four-step pipeline

Four named steps, each one sentence long, and the resulting query is readable
top to bottom by someone who has never seen the schema. The measure to be
careful with is `count(DISTINCT customer_id)`: distinct counts do not roll up,
so you cannot compute buyers per category by summing buyers per product. That
is why `customer_id` is carried all the way down the pipeline rather than
being aggregated away early. Rounding is likewise left to the very end -
dividing two already-rounded numbers gives a subtly different answer, and on a
revenue-per-buyer figure that difference is the sort of thing a finance team
notices.

## Further reading

- [`WITH` Queries](https://www.postgresql.org/docs/16/queries-with.html) - CTE semantics, `VALUES` in a `WITH`, and the materialisation rules the refactors depend on.
- [Combining Queries](https://www.postgresql.org/docs/16/queries-union.html) - `UNION`, `INTERSECT` and `EXCEPT`, and what the `ALL` variants change.
- [Window Functions](https://www.postgresql.org/docs/16/tutorial-window.html) - `lag()` and friends, the alternative spelling exercise 5 is measured against.
- [Aggregate Expressions](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-AGGREGATES) - the `FILTER` clause used in the exercise 7 reference, and `DISTINCT` inside an aggregate.
