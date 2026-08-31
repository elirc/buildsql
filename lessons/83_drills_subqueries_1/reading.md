# Reading - 83_drills_subqueries_1

Where a subquery may stand, what it returns there, and the one question that
decides everything: does it need to know about the outer row?

## Notes

**A subquery is just a query used as a value, a list, or a table.** In
`WHERE x > (SELECT ...)` it must return one row and one column - a scalar. In
`WHERE x IN (SELECT ...)` it returns one column and any number of rows. In
`FROM (SELECT ...) t` it returns a whole table and needs an alias. In the
`SELECT` list it must again be scalar, producing one value per output row.

**Correlated or not is the load-bearing distinction.** If the subquery
mentions a column from the outer query, it is correlated: conceptually it is
re-evaluated for every outer row, and its answer differs from row to row. If
it does not, it is computed once and reused. Everything else about subqueries
- cost, when they are legal, whether they can be rewritten as a join -
follows from that.

**Correlated does not have to mean slow, but it can.** Postgres flattens
correlated `EXISTS` and `IN` into semi-joins and anti-joins, so those cost
about what a join costs. A correlated scalar aggregate in the `SELECT` list is
different: it runs as a subplan per row, and against an unindexed column that
is a full scan per row. Exercise 2 is deliberately the slow spelling so you
can feel it; the fast spelling is the pre-aggregated `LEFT JOIN` in the
reference.

**A subquery does not inherit the outer `WHERE`.** `WHERE category = 'toys'
AND price > (SELECT avg(price) FROM products)` compares toys against the
average of *everything*. If the threshold is meant to be category-specific,
the subquery needs its own filter. This is the single most common
misunderstanding about scalar subqueries.

**`IN` and `NOT IN` are not symmetric in safety.** `IN` behaves sensibly
whatever the list contains. `NOT IN` yields unknown for every row if the list
contains a single NULL, so the query returns nothing at all. It is safe only
when the subquery's column is `NOT NULL` - and knowing that requires checking
the schema, which is why `NOT EXISTS` is the better default.

**A derived table turns `HAVING` into `WHERE`.** Aggregate in a subquery,
name it, and its aggregates become ordinary columns at the next level up.
That is not just a stylistic choice: it lets you filter, sort, join, or
aggregate the aggregates, which `HAVING` alone cannot do.

**Averaging aggregates is two levels, always.** "The average customer's
revenue" is not `avg(orders.total)`. One is the mean of a per-customer sum,
the other the mean of a single order. Both are one line of SQL and they differ
by an order of magnitude.

## ex1 - the uncorrelated scalar

One number, computed once, compared against every row. The subquery mentions
nothing from the outer query, so Postgres evaluates it a single time and
substitutes the result.

The classic mistake is omitting the category filter inside the subquery.
`(SELECT avg(price) FROM products)` is the average across all six categories,
which is a legitimate number and not the one the prompt asked for; the query
runs and returns a plausible number of rows.

The model answer repeats the filter in both places. The reference lifts the
threshold into a one-row CTE and cross-joins it, which makes the "computed
once" explicit and is worth reaching for when the same threshold is needed
twice.

## ex2 - the correlated scalar, in the SELECT list

Two subqueries, both mentioning `c.id`, each producing one value per
customer. This is the shape people write first because it reads exactly like
the requirement, and it is also the shape that scales worst.

The classic mistake is expecting the count to be NULL for a customer with no
orders. `count(*)` over zero rows is 0, so a scalar subquery returning a count
returns 0; `max(total)` over zero rows is NULL. The two behave differently and
the prompt asks for both behaviours on purpose.

The model answer uses the two correlated subqueries. The reference
pre-aggregates the orders into one row per customer and left-joins that,
which computes both measures in one pass instead of two per customer. On this
dataset the difference is roughly a factor of ten, and `orders.customer_id`
has no index - an observation that leads straight into Part 5.

## ex3 - IN with a list

The subquery returns a column of product ids. `IN` asks whether the outer
row's id appears in it, and does not care how many times.

The classic mistake is reaching for a join instead and forgetting that a
product with three qualifying lines then appears three times. `IN` is a
semi-join: it filters the outer rows and never multiplies them.

The model answer uses `IN` with an uncorrelated subquery. The reference uses
a correlated `EXISTS`, which Postgres plans almost identically; the practical
difference is that `EXISTS` can stop at the first match and `IN` may need the
whole list, and that `EXISTS` extends naturally to conditions involving more
than one column.

## ex4 - NOT IN, and when it is safe

Here `NOT IN` is correct, because `reviews.product_id` is declared `NOT NULL`
and the list therefore cannot contain a NULL. That is a real fact about this
schema, and it is the only thing standing between this query and the silent
empty result you met in drill set 78.

The classic mistake is generalising from this exercise. "It worked last time"
is how `NOT IN` gets used against a nullable column, and the failure mode is
zero rows with no error - a result that reads as a legitimate answer.

The model answer uses `NOT IN`; the reference uses `NOT EXISTS`. Both are
correct here; only one of them stays correct when somebody makes the column
nullable next quarter.

## ex5 - the correlated threshold

Every row is compared against a different number: the average of that
person's own team. Correlation is not an optimisation detail here, it is the
requirement - an uncorrelated `(SELECT avg(salary) FROM staff)` would answer
a different question.

The classic mistake is forgetting the CEO. Their `manager_id` is NULL, so the
subquery's `t.manager_id = s.manager_id` matches no rows, `avg` over no rows
is NULL, and `salary > NULL` is unknown - so they are excluded anyway, but by
accident rather than by intent. Saying so explicitly is what the prompt asks
for and what an interviewer listens for.

The model answer is the correlated subquery. The reference computes
`avg(salary) OVER (PARTITION BY manager_id)` in one pass and filters it one
level out - the window-function answer to every "compare each row to its
group" question, and the one to give when the table is large.

## ex6 - the derived table

Aggregate first, filter second. Inside the subquery, `count(*)` is an
aggregate; outside it, `orders` is just a column, and a plain `WHERE` works
on it.

The classic mistake is `WHERE count(*) >= 15` in the original query, which
Postgres rejects because aggregates do not exist at `WHERE` time. The
`HAVING` version is the direct fix and is exactly as correct - the reference
shows it - but the derived table generalises: you can join it, sort by a
computed column, or aggregate it again, none of which `HAVING` gives you.

The model answer wraps the aggregate in a subquery and filters outside. Note
that the ordering has to name the columns as they exist at the level where the
`ORDER BY` runs; in the `HAVING` version you sort by `sum(total)` again,
because the alias is not visible there either.

## ex7 - averaging an aggregate

"The average customer's revenue" requires per-customer revenue to exist
first. That is one subquery to build it and a second aggregate over the
result - two levels, unavoidably.

The classic mistake is `avg(total)` straight from `orders`, which is the
average *order*, around a thousand here rather than around nine thousand.
The query runs, the threshold is nine times too small, and the result set is
far too large - but nothing about it looks wrong unless you know the numbers.

The model answer repeats the per-customer aggregation twice, once for the
rows and once inside the threshold. The reference names it once as a CTE and
uses it in both places, which is shorter, self-documenting, and makes it
obvious that both sides are the same computation.

## ex8 - three subqueries doing three different jobs

The company-wide average is an uncorrelated scalar. The department filter is
on the group's average, so it belongs in `HAVING`. And the top earner's name
is not an aggregate at all - it is a value from one particular row of the
group.

The classic mistake is `max(s.name)`, which Postgres accepts and which
returns the alphabetically last name in the department. It is wrong on most
rows, it never errors, and it is the most common way this shape of report goes
quietly bad.

The model answer puts a correlated subquery in the `SELECT` list of a grouped
query - legal because it references only the grouping column, which is fixed
within the group - ordered by `salary DESC, id` with `LIMIT 1`. The reference
computes the aggregates and the top earners as two separate CTEs and joins
them, using `DISTINCT ON (department)` for the winner. The tie-break on `id`
is required in both: without it, two people on identical salaries would make
the query return different names on different runs.

## Further reading

- [PostgreSQL - Scalar Subqueries](https://www.postgresql.org/docs/16/sql-expressions.html#SQL-SYNTAX-SCALAR-SUBQUERIES) - the rules for a subquery used as a value, including that it must return at most one row and yields NULL when it returns none. Behind ex1, ex2, ex5 and ex8.
- [PostgreSQL - Subquery Expressions: IN, NOT IN, EXISTS](https://www.postgresql.org/docs/16/functions-subquery.html) - the semantics of each, and the explicit warning about `NOT IN` with NULLs. Behind ex3 and ex4.
- [PostgreSQL - Subqueries in FROM](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-SUBQUERIES) - derived tables, why they need an alias, and how they turn aggregates into ordinary columns. Behind ex6 and ex7.
- [PostgreSQL - GROUP BY and HAVING](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-GROUP) - why the restriction in ex8 belongs in `HAVING`, and what a grouped query's `SELECT` list may legally contain.
- [PostgreSQL - Window Functions](https://www.postgresql.org/docs/16/tutorial-window.html) - the one-pass alternative to a correlated per-group aggregate, used in the ex5 reference.
