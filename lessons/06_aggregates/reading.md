# Reading - 06_aggregates

An aggregate is a *fold*: it consumes a set of rows and produces one value.
Everything surprising about aggregates follows from two details — what they
do with NULL, and the fact that the fold happens after `WHERE` and before
`SELECT`.

## Notes

**`count(*)` and `count(col)` are different functions wearing the same
name.** `count(*)` asks "how many rows are in this group?" and never
inspects a value. `count(col)` asks "how many rows have a non-NULL `col`?"
and is really a filter and a count in one. On `staff` they differ by one
because of a single CEO; on a real table with a 40%-nullable column they
differ enormously, and the report says neither which one it used nor why the
numbers do not tie out.

**Every other aggregate skips NULLs too.** `sum`, `avg`, `min`, `max`
silently ignore them. This is usually right — the average of the salaries we
know is a more honest number than treating unknown as zero — but it means
`avg(x)` is the average over a denominator you did not specify and cannot
see. When it matters, say it: `avg(x)` versus `sum(x) / count(*)` versus
`avg(coalesce(x, 0))` are three different questions with three different
answers.

**Aggregates over zero rows.** `count` returns `0`. Everything else returns
`NULL`, not zero. So `sum(total)` over a `WHERE` clause that matched nothing
gives NULL, and a downstream `NULL * 1.2` gives NULL, and a dashboard shows
a blank instead of a zero. `coalesce(sum(total), 0)` is the standard fix,
and it is one of the few places where wrapping an aggregate in `coalesce` is
unambiguously right.

**`FILTER` scopes one aggregate without a second pass.**

```sql
SELECT count(*) FILTER (WHERE status = 'paid')      AS paid,
       count(*) FILTER (WHERE status = 'cancelled') AS cancelled
FROM orders;
```

One scan of 500,000 rows, two independent answers. The older idiom is
`sum(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)`, which works identically
and reads worse; `FILTER` is standard SQL (since 2003) and PostgreSQL has
supported it since 9.4. Lesson 17 builds whole pivot tables out of this one
construct. Note the trap in the old idiom: `count(CASE WHEN ... THEN 1 END)`
works only because the missing `ELSE` yields NULL and `count` skips NULLs —
write `ELSE 0` there and you count every row.

**`count(DISTINCT x)` is a different cost class.** `count(*)` can be
answered by incrementing a counter. `count(DISTINCT x)` requires remembering
every distinct value seen — a sort or a hash table proportional to the
cardinality. On high-cardinality columns over millions of rows this is
frequently the slowest part of a report, and it is the reason approximate
distinct counts (HyperLogLog, available in PostgreSQL through extensions)
exist at all.

**Where aggregation sits in a query.** Logically: `FROM` builds the row set,
`WHERE` filters rows, then aggregation folds them, then `HAVING` filters the
*groups*, then `SELECT` computes output, then `ORDER BY` sorts. That order
explains two rules that otherwise look arbitrary — you cannot use an
aggregate in `WHERE` (it has not happened yet), and you cannot use a SELECT
alias in `WHERE` (it does not exist yet). Lesson 07 makes the whole ladder
explicit.

## ex1 — the orders dashboard row

Five folds over the same 500,000 rows, computed in one pass. Check the
average against `docs/dataset_facts.md` — 1004.58. Anchoring an aggregate to
a known number is a habit worth keeping: it catches a wrong `WHERE` far
faster than reading the query again.

## ex2 — status counts with FILTER

Four scoped counts, one scan. The alternative — four separate queries — is
four scans of half a million rows, and the four answers can disagree with
each other if the data changes between them. Consistency, not just speed, is
an argument for doing it in one statement.

## ex3 — count(\*) is not count(column)

500 versus 499. Now imagine the column is `shipped_at` and the report is
titled "orders this month": `count(shipped_at)` quietly excludes every
unshipped order, the number looks reasonable, and nobody notices for a
quarter. The discipline is to ask, of every aggregate in a review, *what
does this do with NULLs?* — and if the answer is not instant, lesson 05 is
the reread.

## ex4 — counting distinct things

44,997 distinct customers behind 500,000 orders. Two things worth taking
away: the ratio (about eleven orders per buying customer) is a real business
metric that fell out of a `count(DISTINCT)`, and this query is
*significantly* more expensive than ex1 despite returning fewer numbers.
Cheap-looking SQL is not the same as cheap SQL.

## challenge — the all-hands KPI row

Four numbers from four tables in one row, via scalar subqueries. A scalar
subquery is a query in parentheses that returns exactly one row and one
column, and it can appear anywhere a value can. It is the right tool
precisely when the four numbers have *no join key* in common — you are not
relating them, just placing them side by side. Try to do it with joins and
you will produce a cross product or a wrong denominator; lesson 13 covers
the general case.

## review1 — average rating and review count

Two folds over a million rows. The average is 3.00 by construction — a
uniform distribution across the five ratings. When a real-world average
lands exactly on the midpoint, be suspicious: it usually means the data is
synthetic, or the column is not measuring what you think.

## Further reading

- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) — the complete list, including `bool_and`, `string_agg`, `array_agg`, and the ordered-set aggregates like `percentile_cont`.
- [Aggregate Expressions](https://www.postgresql.org/docs/16/sql-expressions.html) — the syntax page: where `DISTINCT`, `ORDER BY` and `FILTER` may appear inside an aggregate call.
- [`FILTER`](https://modern-sql.com/feature/filter) — Markus Winand on why `FILTER` replaced `sum(CASE ...)`, with the portability notes.
- [Query Evaluation Order](https://www.postgresql.org/docs/16/queries-table-expressions.html) — the logical order of `FROM`/`WHERE`/`GROUP BY`/`HAVING`, which explains why aggregates cannot appear in `WHERE`.
