# Reading - 74_drills_inner_joins_2

Eight drills on multi-table joins and the aggregates built on top of them.
Read after your attempt.

## Notes

Chaining joins is mechanical - each new table brings its own `ON` condition
naming the key that connects it to something already in the query - and the
difficulty is never the syntax. It is knowing what one row of the result
means after each step. `orders JOIN order_items` produces one row per item
line, so an order's `total` now appears once per line and summing it
overstates revenue; the line-level measure `oi.quantity * oi.price` is the
one that is safe to sum there. The same duplication makes `count(*)` a line
count, which is why `count(DISTINCT o.id)` exists. As a discipline, decide
the grain of the result before writing the SELECT list: "one row per item
line in a paid order" tells you immediately which measures are additive and
which need `DISTINCT`. Everything else is bookkeeping: alias every table,
qualify every column, keep keys in `ON` and questions in `WHERE`.

## ex1 - the three-table chain

The canonical chain. What to take from it is the grain: forty orders in,
about eighty rows out, because a row of this result is an item line and not
an order. Every aggregate you might add later has to be written with that in
mind. Also note the ordering - `ORDER BY o.id, oi.id` - because lines within
an order come back in whatever sequence the join produced, which is not
necessarily the insertion order and is not stable between runs.

## ex2 - one row per order, counted from its lines

Join out to the grain you need the detail at, then group back up to the grain
you want to report at - the two-step that most real reporting queries are
made of. The `GROUP BY` list is the part that trips people: `o.id` is the
primary key of `orders`, so PostgreSQL would let you select other `orders`
columns ungrouped, but `c.name` belongs to a different table and has to be
grouped explicitly. The prompt's warning about item-less orders is the honest
caveat of every inner join - what does not match does not appear.

## ex3 - revenue per category, paid orders only

The trap named in Hint 2 is the single most expensive mistake in join-based
reporting: after joining orders to their items, `sum(o.total)` adds each
order's total once per line, which inflates revenue by roughly the average
number of lines per order. It is not detectable by eye, because the number is
still the right order of magnitude. The rule to internalise: only sum
measures that live at the grain of the result. Here the result's grain is the
item line, so line values are additive and order totals are not.

## ex4 - counting people through two joins

Two lessons in one drill. The half-open date range is the only formulation
that is correct for timestamps - `BETWEEN` and `<= end-of-month` both leak or
lose rows depending on the time component - and it is worth writing that way
every single time. And distinct counting through two joins is the only way to
get a customer count out of a line-level result; `count(*)` there is a
perfectly good number that answers a different question, which is exactly why
it survives review.

## ex5 - lines, orders and units are three different numbers

This drill exists to make the three numbers sit next to each other so the
difference is unmissable: lines are rows, orders are distinct parents, and
units are a sum of a measure. All three get called "sales" in conversation.
When a stakeholder asks how many expensive items sold last quarter, the
useful reflex is to ask which of these three they mean - and the fact that
`units` exceeds `item_lines` while `orders_touched` is below it tells you
something real about how the category is bought.

## ex6 - HAVING over a join

The full clause stack over a join, in the order the database evaluates it:
join, filter rows, group, aggregate, filter groups, sort. Every question this
lesson set has asked so far fits somewhere in that pipeline, and being able
to place a new requirement in it - is this about a row or about a group? - is
most of what fluency in SQL amounts to. The `WHERE` clause here also changes
the averages themselves, not just which rows are counted, which is why the
prompt says "ignoring cancelled orders" rather than leaving it implicit.

## ex7 - four tables

Four tables is not four times harder than one; it is the same move repeated,
and the only thing that grows is the need to be deliberate about the grain
and about aliases. Note that the customer filter can be written against
`customers.id` or `orders.customer_id` - identical results and, on this
schema, identical work, because the foreign key guarantees they agree.
Chaining like this is also where a missing `ON` condition hurts most: one
forgotten clause turns a join into a cross product with millions of rows.

## ex8 - a cancelled-share report across three tables

The finale combines everything: a three-table join for the dimensions, a
`WHERE` that defines the population, a `FILTER` that defines the numerator
without touching the denominator, and the integer-division guard on the
percentage. The one decision that makes or breaks it is keeping the status
test out of `WHERE` - put it there and every row is cancelled, so the
percentage is 100 for every category and the report looks broken rather than
wrong. `WHERE` for the population, `FILTER` for the slice: that distinction
has now appeared in four of these ten drill sets, which is a fair measure of
how often it matters.

## Further reading

- [Table Expressions - joined tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) - chained joins, `ON` versus `WHERE`, and the join types side by side.
- [Joins Between Tables](https://www.postgresql.org/docs/16/tutorial-join.html) - the tutorial's worked examples, including multi-table queries.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - `count(DISTINCT ...)` and `FILTER`, both of which earn their keep over a joined result.
- [`GROUP BY` and `HAVING`](https://www.postgresql.org/docs/16/queries-table-expressions.html) - grouping a joined result by a column from any of its tables.
