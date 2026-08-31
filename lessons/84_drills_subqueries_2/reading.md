# Reading - 84_drills_subqueries_2

The second half of the subquery toolkit: quantified comparisons, row
constructors, aggregates of aggregates, and the question of which side of a
correlation you drive from.

## Notes

**`ANY` and `ALL` are quantified comparisons.** `x > ANY (subquery)` is true
if the comparison holds for at least one row; `x > ALL (subquery)` if it holds
for every row. `= ANY` is exactly what `IN` means, and `<> ALL` is exactly
what `NOT IN` means - which is also the cleanest explanation of why `NOT IN`
breaks on NULLs.

**The empty-set cases differ, and they matter.** `> ALL` of nothing is
**true** - there is no counterexample. `> ANY` of nothing is **false** - there
is no witness. Rewriting them as `> (SELECT max(...))` and `> (SELECT
min(...))` changes that: both become a comparison against NULL, which is
unknown, so both return no rows. On a non-empty list the two spellings agree
exactly; decide which behaviour you want before you rely on either.

**A row constructor compares several columns at once.** `(a, b) IN (SELECT x,
y FROM ...)` matches only when both columns agree, and `(a, b) < (c, d)`
compares left to right like a compound sort key. Both are standard SQL and
both save you from writing conjunctions by hand - where the risk is writing
only half of one.

**You cannot nest aggregates, so an aggregate of aggregates is two queries.**
`avg(count(*))` is rejected. Group once in a subquery or CTE to produce the
counts as rows, then aggregate those rows. The same shape answers "more than
the average customer", "above the median department", and every other
comparison against a population of groups.

**Correlate from the small side.** A correlated subquery is re-executed once
per row of the query it sits in. Correlating a per-category aggregate from a
scan of the whole products table runs it once per product; correlating it
from a six-row derived table of categories runs it six times, for the same
answer.
When a correlated query is slow, the fix is usually not to remove the
correlation but to move it.

**`EXISTS` and `IN` are cheap; correlated aggregates are not.** Postgres
flattens semi-joins and anti-joins into hash joins. A correlated `count`,
`avg`, or `ORDER BY ... LIMIT 1` in the `SELECT` list runs as a subplan per
row, and against an unindexed column each execution is a full scan. That is
not a reason to avoid them - on a small driving set they are the clearest
thing to write - it is a reason to know how many times they will run.

**"Nearest" is a sort, not a filter.** There is no operator for "closest to";
you order by the absolute difference and take the first row. The tie-break
belongs in the same `ORDER BY`, or the answer changes between runs.

## ex1 - ALL, and the empty-list footnote

`salary > ALL (list)` reads as "beats everybody on that list". The natural
rewrite is `> (SELECT max(...))`, and on this data the two agree exactly.

The classic mistake is assuming they always agree. They part company on an
empty list: `> ALL` of nothing is true, because a universal claim over an
empty set has no counterexample, while `max` of nothing is NULL and every
comparison against NULL is unknown. A filter that quietly returns everybody
in one version and nobody in the other is worth ten seconds of thought.

The model answer uses `> ALL`; the reference spells out the same logic as
`NOT EXISTS (someone on the list this person fails to beat)`, which is what
`ALL` compiles to and which behaves identically in the empty case.

## ex2 - ANY is the other quantifier

`> ANY` needs only one witness, so it is equivalent to `> (SELECT min(...))`.
Reading `ANY` as "at least one" and `ALL` as "every" out loud is enough to
stop confusing them.

The classic mistake is reading `> ANY` as "greater than any of them", which
in English sounds like *all* of them. The SQL keyword means the opposite of
what the English idiom suggests, which is exactly why `SOME` exists as a
synonym - `> SOME (...)` reads correctly and means the same thing.

The model answer uses `> ANY`; the reference compares against the minimum. On
a non-empty list they are interchangeable, and the `min` version is the one
most readers will parse faster.

## ex3 - correlate from the small side

Six averages, six counts. The interesting decision is which side of the
correlation drives: the six-row derived table of category averages, or the
full scan of the products table.

The classic mistake is the one-liner: `FROM products p WHERE p.price >
(SELECT avg(price) FROM products p2 WHERE p2.category = p.category) GROUP BY
p.category`. It is correct, it is the sentence translated directly into SQL,
and it re-executes an aggregate over the whole table once per product. At
full volume it takes minutes; the version driven from the six-row side takes
a fraction of a second.

The model answer builds the averages in a derived table and correlates a
`count` from those six rows. The reference joins the averages back to
`products` and uses `count(*) FILTER (WHERE p.price > a.avg_price)`, which is
one pass and no correlation at all. Both are fine; the version that
correlates from the whole table is the one to recognise and reject.

## ex4 - the previous row, without a window function

For each person, one value from the nearest earlier row in the same
department. A correlated subquery ordered `hired_on DESC` with `LIMIT 1`
picks it out.

The classic mistake is `t.hired_on < s.hired_on`, which is wrong when two
people were hired on the same date: neither is "before" the other, so both
skip past their true neighbour. `(t.hired_on, t.id) < (s.hired_on, s.id)`
compares the pair left to right and gives a strict total order, which is the
same thing the `ORDER BY hired_on, id` in the window version does.

The reference uses `lag(salary) OVER (PARTITION BY department ORDER BY
hired_on, id)` - one pass instead of one scan per person - with the
`engineering` filter applied **one level out**. That placement matters:
window functions run after `WHERE`, so filtering in the same query would
change which rows the window can see. Here it happens not to matter, because
the partition is the department, but the habit of separating the two is what
keeps window queries correct.

## ex5 - an aggregate of aggregates

The threshold is the average number of orders per customer, which requires
per-customer counts to exist before anything can be averaged. `avg(count(*))`
is rejected by Postgres, and the rejection is the hint.

The classic mistake is comparing against something that is not the average
customer - `avg(total)`, or a count over the whole table divided by nothing
in particular. Being able to say precisely which population an average is over
is most of what separates a correct report from a plausible one.

The model answer nests a derived table inside the `HAVING` clause's scalar
subquery. The reference names the per-customer counts once as a CTE and uses
it twice, which is the same computation with the duplication made visible -
and the version that survives somebody adding a third condition.

## ex6 - matching on a pair

`(o.customer_id, o.status) IN (SELECT n.customer_id, n.status FROM ...)` is a
single membership test over two columns. A customer who ordered in both
windows with different statuses does not match, and the row constructor says
that without any conjunctions.

The classic mistake is the hand-written `EXISTS` with only one of the two
equality conditions. It runs, it returns more rows, and nothing about the
result announces that half the requirement is missing. The row-constructor
form cannot be half-written.

The model answer uses the row constructor; the reference writes both
conditions out inside `EXISTS`. Comparing them is the point - the second is
more flexible (it can express inequalities and extra conditions) and is
exactly where the omission bug lives.

## ex7 - a correlated count is a rank

"How many books are cheaper than this one" is a correlated aggregate, and it
is also what `rank()` computes. Doing it by hand is worth practising because
it makes the window-function version obvious later.

The classic mistake is leaving the category filter out of the subquery. The
outer `WHERE p.category = 'books'` does not reach inside; without repeating
it, the count is over every product in the table rather than every book, and
each number comes out several times too large.

The model answer uses the correlated `count` - cheap here because the outer
set is a handful of rows. The reference uses a self-join with
`LEFT JOIN products c ON c.category = 'books' AND c.price < p.price` and a
`GROUP BY`; the join must
be outer, or the cheapest qualifying book - the one whose answer is 0 - would
disappear from the result entirely.

## ex8 - a derived table feeding a correlated subquery

Two dependent steps. The department average has to exist before "nearest to
it" means anything, and the value being correlated on is itself computed.
That is the structural idea worth taking away: a derived table can supply the
correlation value, not just the rows.

The classic mistake is treating "nearest" as a filter and searching for an
operator that does not exist. It is a sort: `ORDER BY abs(salary -
avg_salary)` and `LIMIT 1`. The second mistake is omitting `, s.id` from that
ordering, which leaves two equally typical people to be resolved by the
planner - a query that passes today and returns a different name after the
next `VACUUM`.

The model answer runs two correlated subqueries, one per output column, which
is honest but does the same search twice. The reference does it once with
`DISTINCT ON (department)` over a join to the averages, returning the name and
the salary together - the shape to reach for whenever "the best row per group"
needs more than one column from that row.

## Further reading

- [PostgreSQL - Subquery Expressions: ANY/SOME and ALL](https://www.postgresql.org/docs/16/functions-subquery.html) - the definitions, the note that `= ANY` is `IN` and `<> ALL` is `NOT IN`, and the empty-subquery results that ex1 turns on.
- [PostgreSQL - Row Constructor Comparison](https://www.postgresql.org/docs/16/functions-comparison.html#ROW-WISE-COMPARISON) - how `(a, b) < (c, d)` and `(a, b) IN (...)` are evaluated, used in ex4 and ex6.
- [PostgreSQL - Subqueries in FROM](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-SUBQUERIES) - derived tables, which are what make an aggregate of aggregates expressible in ex3, ex5 and ex8.
- [PostgreSQL - Window Functions](https://www.postgresql.org/docs/16/tutorial-window.html) - `lag` and `rank`, the one-pass alternatives to the correlated subqueries in ex4 and ex7, including where they sit relative to `WHERE`.
- [PostgreSQL - SELECT: DISTINCT ON](https://www.postgresql.org/docs/16/sql-select.html#SQL-DISTINCT) - the single-pass "best row per group" used in the ex8 reference.
