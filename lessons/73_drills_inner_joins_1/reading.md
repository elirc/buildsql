# Reading - 73_drills_inner_joins_1

Eight drills on inner joins and aggregating over them. Read after your
attempt.

## Notes

An inner join is a filtered cross product: conceptually every row of the left
table is paired with every row of the right, and only the pairs satisfying
the `ON` condition survive. That model explains everything that goes wrong
with joins. Forget the `ON` and you get the full cross product, which is why
a query that should return fifty rows returns twenty-five million. Join on a
non-unique column and each left row is duplicated once per match, which is
correct behaviour and also how a `sum` silently doubles. Add a condition
about the right table and you have a choice - `ON` or `WHERE` - which makes
no difference at all for an inner join and makes all the difference for an
outer one, so it is worth writing join conditions in `ON` and filters in
`WHERE` out of habit, before the day somebody changes the join type. When you
aggregate over a join, always ask what one row of the joined result
represents: after `orders JOIN customers` a row is an order, so `count(*)`
counts orders and `count(DISTINCT c.id)` counts customers.

## ex1 - orders with a human name on them

The most common join in the database, written in the shape you should be able
to produce without thinking: `FROM orders o JOIN customers c ON c.id =
o.customer_id`. Two habits to build here. Alias every table and qualify every
column, because the moment a third table arrives, unqualified names become
ambiguous or - worse - silently resolve to the wrong table. And notice that
the order of the two tables in `FROM` is irrelevant for an inner join: the
reference solution starts from `customers` and returns identical rows.

## ex2 - joining a child back to its parent

Joining a child table up to its parent is the safe direction: each child row
has exactly one parent, so the result has exactly as many rows as the child
side had, and no aggregate can be inflated by it. Joining the other way -
parent to children - multiplies the parent's rows, which is fine when you
want it and a bug when you do not. Knowing which side of a join is the "many"
side before you write it is the difference between reading a result and
trusting it.

## ex3 - a filter on the other table

The category lives on one table and the rating on another, which is the whole
point of normalisation and the whole point of joins. Notice how the filters
divide: the join condition expresses the relationship, and the `WHERE`
expresses the question. Mixing them in `ON` produces identical rows here - and
the day somebody makes this a LEFT JOIN to include products with no reviews,
the version with filters in `ON` keeps every product and the version with
filters in `WHERE` does not. Write the habit now.

## ex4 - aggregating across the join

Grouping a fact table by a dimension that lives on another table is the
single most common analytical query there is, and the recipe never changes:
join on the key, filter in `WHERE`, group by the dimension, aggregate the
facts. The thing to keep straight is what a joined row means. Here it is one
order, so `count(*)` is an order count; if the join had been to
`order_items`, the same `count(*)` would be a line count and the same
`sum(o.total)` would be wrong, because the order's total would be added once
per line.

## ex5 - joining the event stream

Event tables are where the gap between "how many events" and "how many
people" matters most, because one enthusiastic customer can produce hundreds
of rows. `count(*)` and `count(DISTINCT customer_id)` over the same joined
result answer the two halves of every engagement metric. Note also that
`events.customer_id` carries no foreign key constraint in this schema - the
join still works, because a join needs matching values and not a declared
relationship, but nothing guarantees every event's customer exists, which is
the kind of thing an inner join hides by dropping the row.

## ex6 - join, group, threshold

The functional-dependency rule is on display in the reference solution:
grouping by a table's primary key permits selecting that table's other
columns ungrouped, because the key determines them. It is legal, standard,
and saves listing five columns in a `GROUP BY` just to display them. The rest
is the familiar pattern - join for the name, group for the count, `HAVING`
for the threshold - and the tie-break in the `ORDER BY` is what makes the
result reproducible.

## ex7 - three tables, one customer

The three-table chain is the backbone of any order report, and this drill
also makes a modelling point: `order_items.price` exists because the price a
customer paid must not change when the catalogue does. Using `p.price` here
would produce a number that quietly rewrites history. The ordering needs both
keys because one order contributes several lines, and lines within an order
have no inherent order otherwise.

## ex8 - two grouping keys across a join

A two-dimensional breakdown across a join, which is the long-form version of
the cross-tab a stakeholder actually wants to see - one row per (country,
status) pair that occurs. Because both countries have orders in all four
statuses, the result is a complete grid here; with a sparser slice it would
not be, and the missing combinations would be invisible rather than zero.
Lesson 17 pivots this shape into columns, and lesson 50 adds the per-country
subtotals in the same pass.

## Further reading

- [Joins Between Tables](https://www.postgresql.org/docs/16/tutorial-join.html) - the tutorial chapter, worth rereading once you have written a few dozen joins.
- [Table Expressions - joined tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) - the formal definition of each join type, including `ON` versus `WHERE`.
- [`SELECT`](https://www.postgresql.org/docs/16/sql-select.html) - the `FROM` clause reference, including table aliases and their scope.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - the aggregates applied over joined rows in the second half of this set.
