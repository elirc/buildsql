# Reading - 08_inner_joins

A relational database stores each fact once and reassembles facts on demand.
`JOIN` is the reassembly. Everything else in Part 1 was preparation for this
lesson, and every difficult query in Parts 2 and 5 is a join wearing a
costume.

## Notes

**A join is a filtered cross product, conceptually.** Take every pairing of
a left row with a right row, keep the pairs where the `ON` condition is
true. No database actually does that — it uses a nested loop, a hash table,
or a merge of two sorted streams (lesson 37) — but the mental model is
exactly right for reasoning about *results*. It also explains the classic
disaster: omit the `ON` condition and you get all 500,000 × 50,000 pairs,
which is not an error, just twenty-five billion rows.

**Cardinality — "the grain" — is the question to ask first.** Before you
write a join, know whether the relationship is one-to-one, one-to-many, or
many-to-many, because it determines the number of rows that come out.
Joining `orders` to `customers` is many-to-one: the row count stays 500,000.
Joining `orders` to `order_items` is one-to-many: the row count *doubles* to
a million, and every `orders` column is now duplicated across its lines.
That duplication is harmless until you aggregate — and then
`sum(o.total)` counts each order once per line item and your revenue figure
is wrong by exactly the average basket size. Production dashboards have
shipped numbers inflated 100× for precisely this reason. The fix is to
aggregate before joining (a subquery or CTE — lessons 13 and 14) or to
aggregate something that is not duplicated.

**`ON` versus `WHERE`.** For an inner join they are interchangeable — the
planner may even move conditions between them. Build the habit anyway:
`ON` expresses *how the tables relate*, `WHERE` expresses *which rows you
want*. Lesson 09 is where the distinction stops being stylistic and starts
changing the answer.

**Qualify every column.** With two tables in scope, a bare `id` is
ambiguous, and PostgreSQL will tell you so. With three, an unqualified
column that happens to be unique today becomes an error the day someone adds
a column with that name elsewhere. Alias every table, qualify every column;
it costs two characters and makes the query readable by someone who does not
know the schema.

**`USING` and `NATURAL JOIN`.** `JOIN order_items USING (order_id)` is a
shorthand when both columns have the same name, and it merges them into one
output column. `NATURAL JOIN` guesses the join key from *every* commonly
named column — including `id` and `created_at`, which is why it is a
footgun and why you will not see it in this course. Explicit `ON` clauses
never surprise anyone.

**Joins compose freely with everything else.** Join then filter, join then
group, join three tables then group by a column of the second — the query is
built by composing clauses whose meanings do not change. That
compositionality is the actual reason SQL survived fifty years.

## ex1 — orders with names

The canonical many-to-one join. 2,569 rows out of 500,000, each carrying a
name that lives in another table. Note that the result count equals the
number of matching *orders* — because every order has exactly one customer,
guaranteed by the foreign key.

## ex2 — a receipt, three tables

Joins chain: `orders` → `order_items` → `products`. Read the FROM clause as
a path through the schema diagram in [docs/dataset.md](../../docs/dataset.md).
Once you see joins as walking edges of a graph, five-table queries stop
being intimidating.

Notice that `orders` contributes no columns to the output — it is there
purely to be filtered on. That is completely normal and worth being
comfortable with: a table can appear in a join because it holds the
condition, because it holds the output, or because it is a bridge between
two tables that do not reference each other directly. `order_items` here is
all three at once.

## ex3 — revenue per category

Join then group, and the first place the *grain* matters in your favour:
`sum(quantity * price)` uses the line item's own price — the historical
snapshot — not the product's current price. Using `p.price` here would
silently rewrite history every time someone edited the catalogue. Storing
the price at order time is a deliberate schema decision, and lesson 26 comes
back to why.

## ex4 — reputation per category

The same shape as ex3 on a different pair of tables. Reps like this are what
make the pattern automatic: identify the two tables, write the ON, decide
the grouping column, choose the aggregates. Note the averages come out near
3.00 in every category — uniform synthetic data — which is a good reminder
that a join and a group can be perfectly correct and still tell you nothing
interesting.

## ex5 — filtering across the join

Three filters spanning two tables, all in `WHERE`. This is the exercise to
remember when lesson 09 tells you that moving one of them into `ON` changes
the answer. For an inner join, `ON` and `WHERE` are algebraically the same;
for an outer join they are not, and the difference has cost people months of
wrong dashboards.

## ex6 — revenue by country

The plan is the interesting part. Half a million rows meet fifty thousand,
and PostgreSQL builds a hash table on the smaller side — you can see it in
`dojo plan` as `Hash Join` with a `Hash` node under it. Lesson 37 covers why
it chose that over a nested loop (no index on `orders.customer_id`, and it
needs every row anyway) and what would change its mind.

## challenge — the five-table drill-down

The grain problem, weaponised. Joining `reviews` multiplies every order line
by roughly a hundred, so `sum(quantity)` is inflated a hundredfold while
`avg(rating)` is unaffected — because averaging a hundred copies of the same
set of ratings gives the same answer. The `avg(oi.quantity)::int` dodge works
for the same reason, and it is a dodge: the honest fix is to aggregate the
line items before joining the reviews. The point of the exercise is not the
trick, it is *noticing that there is a problem to solve*.

## review1 — big orders from one country

A two-table join with filters on both sides. When it returns, ask yourself
the grain question out loud before you look at the row count.

The answer, for this one: `orders` to `customers` is many-to-one, so the
result has exactly one row per qualifying order and no order is duplicated.
That is the property that would make `sum(o.total)` safe here — and the
property that evaporates the moment somebody adds a join to `order_items`
"just to get the product names". Every added join is a fresh cardinality
question.

## Further reading

- [Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html) — the definitive description of `INNER`/`LEFT`/`RIGHT`/`FULL`, `ON`, `USING`, and `NATURAL`.
- [`SELECT` — FROM clause](https://www.postgresql.org/docs/16/sql-select.html) — table aliases and how they scope column references.
- [Use The Index, Luke — Joins](https://use-the-index-luke.com/sql/join) — nested loops, hash joins and sort-merge joins explained from the index outward. This is the best single preparation for lesson 37.
- [Don't Do This — `NATURAL JOIN`](https://wiki.postgresql.org/wiki/Don%27t_Do_This) — why guessing the join key is a bad idea in a schema that will change.
