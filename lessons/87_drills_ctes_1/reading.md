# Reading - 87_drills_ctes_1

Eight drills on naming intermediate results with `WITH`. Read after your
attempt, pass or fail.

## Notes

A common table expression is a `SELECT` with a name attached, visible to the
statement that follows it and to every CTE declared after it. That is nearly
all there is to the syntax, and the whole reason to reach for one is that a
query which reads top to bottom in named steps is a query a colleague can
review. The mechanics worth knowing are these. A CTE referenced **once** is,
since PostgreSQL 12, normally inlined - folded into the outer query and
optimised together with it, exactly as if you had written a subquery in
`FROM`. A CTE referenced **more than once** is materialised: computed once,
stored in a work table, and read back by every reference. That is why exercise
2, exercise 5 and exercise 7 are worth writing as CTEs and not as repeated
subqueries - the repeated-subquery spelling computes the same aggregate twice.
You can force either behaviour with `WITH x AS MATERIALIZED (...)` or
`AS NOT MATERIALIZED (...)` when the planner guesses wrong. What a CTE does
*not* do is create an index, cache anything between statements, or make a slow
aggregate fast; it changes how the query reads, and occasionally how many
times a subresult is computed.

## ex1 - name the slice you are working on

The smallest possible refactor: give the filtered rows a name, then forget
that a `WHERE` clause was involved. Because `recent` is referenced once,
PostgreSQL inlines it and produces exactly the plan the reference's plain
`WHERE ... GROUP BY` produces - identical work, and the CTE version says what
the slice *is* rather than making the reader reconstruct it. The classic
mistake at this stage is putting the `GROUP BY` inside the CTE as well, which
leaves the outer query with nothing to do.

## ex2 - one result, used twice

Here the CTE earns its keep: the grand total and the per-status rows come from
the same aggregate, and naming it means `orders` is grouped once instead of
twice. Two references, so PostgreSQL materialises it. The classic mistake is
writing `sum(revenue)` in the outer query and expecting the whole-table total
- inside a query reading four grouped rows, that is a different aggregation
again. The reference's window spelling, `sum(sum(total)) OVER ()`, is the
one-pass alternative and worth having in your fingers.

## ex3 - two links in a chain

Each CTE can see the ones declared before it, which is what makes a chain
possible: aggregate, then join, then aggregate again. Summing per product
first and per category second gives the same numbers as one grouped join
because `sum` is associative - but not every measure is, and the habit of
asking "does this roll up?" is worth forming here where the answer is easy.
`count(DISTINCT ...)` famously does not roll up, which is the trap waiting in
set 88.

## ex4 - a CTE that holds a single number

A one-row, one-column CTE cross-joined into the query gives a threshold a name
and a place to be documented, and costs nothing: the planner evaluates it once
either way. The classic mistake is worrying that a `CROSS JOIN` multiplies
rows - it does, by one, because `bar` has exactly one row. The reference's
scalar-subquery spelling is shorter; the CTE spelling is what you want the
moment a second derived constant appears.

## ex5 - three links, then a self-reference

Two independent aggregates joined and then divided, with the result of the
division compared against its own average. The division is the interesting
part: `orders` and `customers` are both integers, so without the `::numeric`
cast PostgreSQL performs integer division and every country's ratio collapses
to 10. Note also that this is a **density**, not a count, which is what makes
the exercise behave the same way whether the database was seeded at full size
or at a tenth of it.

## ex6 - label first, aggregate second

Assigning a label in one step and aggregating by it in the next is the readable
way to write any tiering report, because the `CASE` appears exactly once. The
reference shows the alternative - repeat the `CASE` in the `SELECT` list and
group by ordinal - and the moment a fourth tier or a changed boundary arrives,
the two-step version is the one that does not develop a bug. Watch the
boundaries: `>= 15` then `>= 8` is evaluated top to bottom, so the second arm
means "8 to 14" without saying so.

## ex7 - the diamond

`per_customer` feeds both `stats` and the final query, which is a genuine
dependency diamond and the case where materialisation matters most - the
500,000-row aggregate happens once and is read twice. The classic mistake is
comparing revenue against `round(avg_revenue, 2)`: rounding belongs in the
output, never in a comparison. `CROSS JOIN stats` is the natural spelling
because `stats` is one row; the reference's twin scalar subqueries do the same
job and let the planner decide how often to run them.

## ex8 - the worst-reviewed product in each category

Three chained CTEs and then a join back to the middle one, which is the
classic "find the extremum, then find the rows that hold it" shape. Joining on
the value rather than picking one arbitrary row is what makes ties appear, as
the prompt requires. The classic mistake is `min(avg_rating)` in the same
`SELECT` as `name`, which PostgreSQL rejects because a name has no single
value per category. The reference's `rank() OVER (PARTITION BY category ...)`
with `WHERE worst_rank = 1` is the window-function answer to the same
question, and set 90 drills it directly.

## Further reading

- [`WITH` Queries](https://www.postgresql.org/docs/16/queries-with.html) - the full CTE reference, including `MATERIALIZED` / `NOT MATERIALIZED` and when the planner inlines.
- [`SELECT`](https://www.postgresql.org/docs/16/sql-select.html) - the `WITH` clause grammar and where a CTE may be referenced.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - which aggregates roll up cleanly through a chain and which do not.
- [Numeric Types](https://www.postgresql.org/docs/16/datatype-numeric.html) - integer division, and why the cast in exercise 5 is not optional.
