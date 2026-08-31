# Reading - 91_drills_windows_2

Eight drills contrasting a window partition with a grouping. Read after your
attempt, pass or fail.

## Notes

Both `GROUP BY` and `PARTITION BY` cut the rows into piles and compute an
aggregate per pile. The difference is what comes out: `GROUP BY` emits one row
per pile and the detail is gone, while a window aggregate emits every input row
with the pile's answer attached. That single distinction decides which one a
report needs, and the test is easy - if the output should still name
individual orders, products or people, you want a window; if the output is a
summary, you want a grouping. They also compose, which is where exercises 3,
4 and 6 live: `GROUP BY` runs first, the grouped rows become the window's
input, and a window aggregate written over them is an aggregate *of*
aggregates - hence `sum(sum(total)) OVER ()`, which reads strangely and is
completely regular once you see that the inner `sum` belongs to the group and
the outer one to the window. Two practical notes. A window is evaluated after
`WHERE` and `HAVING`, so it never sees rows those clauses removed - exercise 1
depends on this and it is a common source of "why is my percentage wrong".
And a window aggregate with no `ORDER BY` in its `OVER` clause covers the
whole partition; add an `ORDER BY` and it silently becomes a running total,
which is set 92's subject.

## ex1 - a window sees only what survived WHERE

Four hundred-odd expensive products, each carrying its category's count and
average - but the count and average describe only the products above 480, not
the category as a whole. This is exactly what you want when the filter defines
the population you are reporting on, and exactly what bites you when it does
not. If you needed the full-category average next to a filtered list of rows,
the window cannot give it to you: you would compute the average in a CTE over
the unfiltered table and join, which is the shape used in set 88.

## ex2 - detail rows that carry their total

The plainest statement of the difference. `GROUP BY customer_id` would give
fifteen rows; the window gives every order with its customer's totals
attached, which is what an account statement looks like. The classic mistake is
adding `GROUP BY` out of habit and then being unable to select `id`. The
reference's join to a derived per-customer aggregate is what this had to be
before window functions, and it reads the table twice.

## ex3 - an aggregate of the aggregates

`sum(sum(total)) OVER ()` is the idiom worth memorising: an unpartitioned
window over grouped rows gives you the grand total without a second scan, a
CTE, or a scalar subquery. The classic mistake is `sum(total) OVER ()`, which
PostgreSQL rejects because `total` is not grouped - the window's input is the
grouped rows, so its argument has to be an aggregate too. The reference's
two-CTE version is more verbose and computes exactly the same thing.

## ex4 - a partition over grouped rows

The same idiom with a partition, which turns "share of everything" into "share
of my country". This is the workhorse behind every percentage-of-subtotal
report. Note the `100.0`: `count(*)` is a bigint and integer division would
report zero for every row. Note also that this asks for a share of orders,
not of revenue - the same query shape answers both, and confusing them is how
percentage reports acquire a reputation for being untrustworthy.

## ex5 - a partition on two keys, one of them computed

Partitioning on `(customer_id, date_trunc('month', created_at))` gives each
order the total of its customer's month, and the same expression has to appear
identically in the window definition and in any join condition you write in
its place. The reference does write it in a join condition, which is why it has
to repeat `date_trunc('month', o.created_at)` and why one typo there would
silently produce wrong totals. The window version cannot drift out of sync
with itself.

## ex6 - group by two things, partition by one of them

Thirty rows, one per category-and-colour pair, with the category's total
carried along - the classic subtotal layout. The window partitions by
`category`, which is one of the two grouping keys, so each partition contains
the five colour rows of a category. Grouping by a jsonb expression works
exactly like grouping by a column, though it cannot use an ordinary index; an
expression index on `(attributes->>'color')` is what lesson 40 is for.

## ex7 - GROUP BY, spelled with a window

The two forms give identical answers, and the window form is almost always the
wrong choice: `GROUP BY` aggregates 10,000 rows down to 6 as it scans, while
the window computes the pair of aggregates for every one of the 10,000 rows,
materialises them all, and then `DISTINCT` sorts the lot to throw 9,994 away.
Knowing they are equivalent is still worth something - it is the cleanest
proof that a partition and a group are the same cut of the data - and the
trick earns its place when you already have windows in the query and want one
more summary line without a second pass.

## ex8 - how concentrated is each category

Two windows over the same partition doing different jobs: one totals the
category, the other picks its leader. Filtering on `rn = 1` needs the extra
CTE level, as always. The share comes out at a fraction of a percent, which is
the real finding - with sixteen hundred products per category, no single
product dominates - and it is the kind of number that only means anything at
three decimal places, which is why the prompt asks for three. The reference
joins on `revenue = max(revenue)` instead, which would return two rows for a
category if two products ever tied exactly.

## Further reading

- [Window Functions](https://www.postgresql.org/docs/16/tutorial-window.html) - the introduction, with the `GROUP BY` comparison spelled out.
- [Window Function Processing](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-WINDOW) - where windows sit relative to `WHERE`, `GROUP BY` and `HAVING`.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - which aggregates may be used as window functions, and the `FILTER` clause.
- [JSON Functions and Operators](https://www.postgresql.org/docs/16/functions-json.html) - `->>` and the other accessors used to group by a jsonb key.
