# Reading - 76_drills_outer_joins_1

Outer joins, and the small number of ways they go wrong. Every problem in
this set is one of them.

## Notes

**An outer join is a promise about the left side.** `A LEFT JOIN B` says:
every row of `A` appears in the output at least once. Where a matching `B`
row exists you get the pair; where none exists you get the `A` row with every
`B` column set to NULL. That invented row is called a NULL-extension, and
almost every bug in this set is a query that destroys one somewhere.

**`count(*)` counts rows; `count(col)` counts values.** A NULL-extended row
is a row, so `count(*)` in a group with no matches returns 1. `count(b.id)`
skips NULLs and returns 0. This is the single most common outer-join defect
in production reporting, and it is invisible until somebody notices that
nobody has zero of anything.

**`sum` over nothing is NULL, not zero.** Counts recover on their own;
sums, averages, mins and maxes do not. `coalesce(sum(x), 0)` is the fix, and
you have to decide consciously whether zero is even the honest answer - for a
sum it usually is, for an average it usually is not.

**A restriction on the right table belongs in `ON`.** `WHERE b.something =
'x'` is evaluated after the join, and it is false for every NULL-extended
row, so it silently deletes them and turns your outer join into an inner one.
Putting the same predicate in the `ON` clause makes it part of what counts as
a match instead, and the unmatched left rows survive. A restriction on the
*left* table is unaffected either way, which is why the rule is easy to
half-learn.

**`RIGHT` is `LEFT` with the tables swapped.** There is no third semantics to
memorise: decide which table must survive, then put it on the surviving side
of the keyword. Most codebases write everything as `LEFT` for consistency,
which is a fine convention as long as you can read the other one.

**Outer-ness has to survive every hop.** In a three-table chain, one inner
join anywhere downstream throws away the rows the outer join was protecting.
And once a second one-to-many join enters the query, counts start
double-counting: `count(DISTINCT ...)` is the repair for a count, and
pre-aggregating each branch is the repair for everything else.

## ex1 - the customers who never bought anything

The most-used outer join there is: a dimension, its facts, and a requirement
that the dimension come back whole. An inner join answers a different
question - "customers who have ordered" - and answers it correctly, which is
why the bug survives review.

The classic mistake is `count(*)`. The customers with no orders are exactly
the rows you added the `LEFT JOIN` to keep, and `count(*)` reports 1 for each
of them, so the report says every Spanish customer has ordered at least once.

The model answer left-joins orders onto customers, groups by the customer,
and counts `o.id` - a column that is NULL precisely when the NULL-extension
happened. The reference solution takes the other good route: aggregate orders
per customer first, then left-join that summary and `coalesce` the miss.

## ex2 - counts and sums behave differently

Roughly one order in seven in this dataset has no line items at all, so this
is the same shape as ex1 with one extra wrinkle: two measures that fail in
two different ways.

The classic mistake is `coalesce`ing neither, or both, without thinking.
`count(oi.id)` is already 0 for an empty group; wrapping it in `coalesce`
does nothing and suggests you have not worked out why. `sum(oi.quantity)`
over an empty group is NULL - SQL's aggregate functions ignore NULL inputs,
and the sum of no numbers is undefined rather than zero - so that one does
need the wrapper.

The model answer left-joins the lines, groups by the order, and treats the
two measures differently on purpose.

## ex3 - the raw shape, before any grouping

Strip the aggregation away and you can see what a `LEFT JOIN` actually
produces: one output row per matching pair, plus one NULL-extended row for
each left row that matched nothing. Being able to picture this is what makes
the aggregated versions obvious rather than magical.

The classic mistake is expecting NULLs where there are matches. A customer
with eleven orders contributes eleven rows and no NULLs; only the customers
with zero orders get the invented row. The second mistake is the ordering:
Postgres sorts NULLs **last** in ascending order by default, so producing
them first takes an explicit `NULLS FIRST`.

The model answer is a plain `LEFT JOIN` with both customer predicates in
`WHERE`, which is safe because they restrict the left table. The reference
solution spells the semantics out literally - an inner join `UNION ALL` the
unmatched rows with NULLs supplied by hand - which is exactly what a `LEFT
JOIN` means and worth reading once.

## ex4 - the same thing, mirrored

`RIGHT JOIN` keeps every row of the table on its right. That is the whole
definition. The exercise forces the direction so that the mirror gets
practised rather than avoided, because you will read code that uses it.

The classic mistake here is not the keyword, it is the predicates. `rating =
5` and the date restriction describe which reviews count as a match, so they
belong in the `ON` clause; move either into `WHERE` and every product without
a recent 5-star review is deleted from the report - the exact thing the outer
join was there to prevent.

The model answer puts all three conditions on the reviews side into `ON`,
keeps the two product predicates in `WHERE` (they restrict the surviving
table, so they are safe there), and counts `r.id`.

## ex5 - inner and outer in the same query

Two joins, two different jobs. `customers` is present only to supply the
country filter, and every order has a customer, so that join can and should
be inner. `order_items` is present to be counted, and an order with no
`quantity = 5` line still belongs in the report, so that one must be outer.

The classic mistake is a blanket policy - making everything a `LEFT JOIN`
"to be safe", or making everything inner out of habit. Mixing them in one
`FROM` is completely normal; the question to ask at each join is "can this
side legitimately have nothing, and do I still want the row if it does?"

The model answer inner-joins the customer, left-joins the lines with
`quantity = 5` in the `ON`, and counts `oi.id`.

## ex6 - print the bug next to the fix

This one is deliberately artificial: both columns come from the same grouped
outer join and differ only in what is being counted. Seeing `1` and `0` on
the same row is the fastest way to make the distinction permanent.

The classic mistake is assuming `count(*)` and `count(col)` are
interchangeable because on inner joins they usually are. They diverge exactly
where outer joins matter, which is exactly where you are least likely to be
checking.

The model answer groups the left join and writes both counts; note that the
`total > 1900` restriction has to be in the `ON` clause, or there would be no
unmatched customers left to demonstrate anything.

## ex7 - outer-ness has to survive two hops

A customer with no orders has no order lines either, so the second join has
nothing to match. Write it as an inner join and those customers vanish from
the answer - the `LEFT JOIN` in the first hop bought you nothing, because the
second hop threw the rows away again.

The classic mistake after fixing that is the order count. Once `order_items`
is in the `FROM`, a three-line order contributes three rows, so `count(o.id)`
counts lines and labels them orders. `count(DISTINCT o.id)` is what survives
the fan-out; `sum(oi.quantity)` is already at line grain and is correct as it
stands, but still needs `coalesce` for the customers with nothing.

The model answer chains two `LEFT JOIN`s and mixes `count(DISTINCT ...)` with
a coalesced `sum`. The reference pre-aggregates orders and lines per customer
in a subquery and joins the summary, which is the shape that scales to five
measures without any of this reasoning.

## ex8 - two branches, both outer

Order lines and reviews are independent branches hanging off the same
product. Join both and the rows multiply: a product with 20 qualifying lines
and 2 qualifying reviews produces 40 rows, and both plain counts report 40.
The result is not a little wrong, it is wrong by the size of the other
branch.

The classic mistake is trusting the number because it is plausible. Forty
lines for a popular toy looks fine; the only way to catch it is to know the
shape of your `FROM` and count the join paths.

The model answer uses `count(DISTINCT oi.id)` and `count(DISTINCT r.id)`,
which works because each branch carries its own primary key, and keeps every
non-product predicate in an `ON` clause so that products with nothing to
report still appear with zeros. The reference solution pre-aggregates each
branch into its own subquery and left-joins both - slower to type, immune to
the whole class of bug, and the answer you should give when an interviewer
asks how you would add a third measure.

## Further reading

- [PostgreSQL - Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) - the formal definition of `LEFT`, `RIGHT` and `FULL` joins, including the sentence about the `ON` condition being applied before NULL-extension. The source of truth for ex4 and ex5.
- [PostgreSQL - Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - `count(*)` versus `count(expression)`, and the note that aggregates other than `count` return NULL over an empty input. Behind ex1, ex2 and ex6.
- [PostgreSQL - COALESCE](https://www.postgresql.org/docs/16/functions-conditional.html#FUNCTIONS-COALESCE-NVL-IFNULL) - the standard way to give a missing measure a defined value, and its type-resolution rules.
- [PostgreSQL - ORDER BY and NULLS FIRST/LAST](https://www.postgresql.org/docs/16/queries-order.html) - why NULLs sort last by default in ascending order, which is the ordering trap in ex3.
- [Modern SQL - outer joins and the ON clause](https://modern-sql.com/feature/left-join) - a compact tour of what moves between `ON` and `WHERE`, with the same examples in other engines.
