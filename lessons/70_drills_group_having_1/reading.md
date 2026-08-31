# Reading - 70_drills_group_having_1

Eight drills on producing one row per group and then filtering those rows.
Read after your attempt, pass or fail.

## Notes

`GROUP BY` replaces many rows with one, and everything that follows is
governed by that: a column you did not group by no longer has a single value,
so PostgreSQL refuses to guess one. The clause order is the mental model -
`FROM`, then `WHERE`, then `GROUP BY`, then the aggregates, then `HAVING`,
then `SELECT`, then `ORDER BY`. Reading it top to bottom answers most
questions this set raises. Why can `WHERE` not see `count(*)`? It runs before
the counting. Why can `HAVING`? It runs after. Why can `ORDER BY` use a
SELECT alias while `HAVING` cannot? Because the SELECT list has been
evaluated by then. And why does a group with no rows never appear? Because
groups are formed from rows that exist; `GROUP BY` invents nothing, which is
why zero-rows-in-a-period reports need a generated calendar and a `LEFT JOIN`
rather than a cleverer aggregate.

## ex1 - customers per country

The simplest possible grouped report, and the one to be able to type without
thinking. Two habits worth forming here: check the group count against
`docs/dataset_facts.md` (twelve countries) so a stray `GROUP BY` column shows
up immediately, and always sort the output, because a hash aggregate returns
groups in memory order and that order can change between runs and between
PostgreSQL versions.

## ex2 - filter the rows, then group them

A condition on the grouping key can be written in either clause and means the
same thing, which makes it the perfect place to see why one of them is right
anyway. In `WHERE`, three fifths of the table never enters the aggregation;
in `HAVING`, every rating is grouped and then three of the five groups are
discarded. Same rows out, several times the work. The classic mistake is
learning `HAVING` and then reaching for it whenever a `GROUP BY` is present.

## ex3 - the department table

The department report is the canonical `GROUP BY` example because each column
demonstrates a different aggregate over the identical set of rows. Notice
that `max(salary)` tells you the top salary but not who earns it: pulling the
name along would require grouping by name too, which would give you one row
per person. Getting the row that carries the maximum is a window-function job
(lesson 15), and recognising which of the two questions you are being asked
is most of the skill.

## ex4 - HAVING on an average

The difference between filtering rows and filtering groups is at its clearest
here, because the `WHERE` version is not merely slower - it answers a
different and rather silly question, returning every category with an average
computed over its expensive products only. `HAVING` sees the group after the
aggregate exists, which is why the aggregate has to be spelled out again
rather than referenced by its output alias. PostgreSQL permits aliases in
`GROUP BY` and `ORDER BY`, but not in `HAVING`.

## ex5 - WHERE and HAVING in one query

This is the shape of nearly every "power user" query: a period in `WHERE`, a
threshold in `HAVING`. The subtlety that catches people is that `HAVING`
counts post-`WHERE` rows, so a customer with forty orders in 2022 and two in
2023 does not appear - which is correct, and is also the thing to state out
loud when somebody asks why their favourite customer is missing. Model
answer: date in `WHERE`, count in `HAVING`, and the revenue column
automatically covers the same restricted set.

## ex6 - grouping by a computed value

Grouping by an expression is how every histogram, every "per month", and
every tier report is built. Two practical notes come with it. The expression
must be repeated (or referenced by ordinal) rather than aliased in `GROUP
BY`, because the SELECT list is evaluated afterwards - PostgreSQL is generous
about accepting the alias anyway, but do not rely on it in portable SQL. And
a grouped expression cannot use an ordinary index on the underlying column,
which is what expression indexes exist for, in lesson 40.

## ex7 - the biggest groups first

Top-N over groups is `GROUP BY` plus `ORDER BY` plus `LIMIT`, and the piece
people leave out is determinism. Any two groups with equal counts can come
back in either order, so a report that shows "the top five" may show a
different five tomorrow with identical data - which is indistinguishable from
a bug. Adding the tie-break costs nothing and makes the result reproducible.
Note also that this is top-N over the whole table; top-N *within* each group
is a different problem and needs a window function (lesson 15).

## ex8 - HAVING on a distinct count

Frequency and recency questions - active months, distinct products bought,
number of countries shipped to - are all `count(DISTINCT expr)` in `HAVING`,
and they are impossible to express in `WHERE` because no single row knows
how many months its customer was active. The alternative shown in the
reference is worth knowing: compute the aggregate once in a CTE and filter it
with an ordinary `WHERE` in the outer query, which reads better when the
condition is long and lets you avoid repeating the expression.

## Further reading

- [`GROUP BY` and `HAVING`](https://www.postgresql.org/docs/16/queries-table-expressions.html) - sections 7.2.3 and 7.2.4, including grouping by a primary key and the functional-dependency exception.
- [`SELECT`](https://www.postgresql.org/docs/16/sql-select.html) - the clause-by-clause reference, including `GROUP BY` ordinals and output aliases.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - what each aggregate does inside a group, and the `FILTER` clause.
- [Use The Index, Luke - Grouping](https://use-the-index-luke.com/sql/sorting-grouping) - hash aggregate versus group aggregate, and why an index can matter to a `GROUP BY`.
