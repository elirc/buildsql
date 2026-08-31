# Reading - 82_drills_multi_join_2

Reports whose measures come from two different one-to-many relationships.
There is one right structural move, and this set makes you perform it six
different ways.

## Notes

**Two branches multiply.** `products` has many order lines and many reviews.
Put both in one `FROM` and you get the cross product per product: 40 lines
times 100 reviews is 4,000 rows where you wanted 140. Counts can be repaired
with `count(DISTINCT ...)` because each branch carries a primary key. Sums
cannot be repaired at all.

**Averages hide the damage.** This is what makes fan-out genuinely dangerous
rather than merely annoying. When every review of a product is duplicated the
same number of times, the *average* rating is unchanged - so a report showing
a plausible 3.01 average next to a revenue figure a hundred times too large
looks internally consistent. The average is not evidence that the join is
sound.

**Summarise, then join.** One CTE per branch, each grouped to the reporting
key, joined at the end. It is more typing, it is immune to the whole class of
bug, and it extends to a fourth measure without any new reasoning. When
somebody asks how you would add "returns" to the report, this is the answer
that costs nothing.

**Not every pair of tables has a join key.** Signups per month and orders per
month share only a time axis. There is no meaningful `customers JOIN orders`
for that question - a customer who signed up in March may have ordered in
July. Aggregate each side to the axis and join on the axis.

**Zero and NULL are different answers.** Units sold and review counts become
`0` when there is nothing, because zero sales is a real quantity. An average
rating over no reviews stays NULL, because the average of nothing is not
zero - `coalesce`ing it would assert that nobody liked a product nobody
rated.

**`count(DISTINCT ...)` in `HAVING` is normal.** When the measure being
filtered is itself the distinct count, you write the expression twice: once
in `SELECT` and once in `HAVING`, because `HAVING` cannot see output aliases.
Reducing to distinct pairs in a subquery first turns it back into a plain
`count(*)` and is usually cheaper.

## ex1 - counting two things at two grains

The join is one-to-many from products to reviews, so after it the review is
the grain. `count(*)` counts reviews, which is one of the columns you want;
the other column wants products, and each product now appears once per review.

The classic mistake is `count(p.id)`, which counts non-NULL product ids -
that is, reviews again. The distinction between `count(x)` and
`count(DISTINCT x)` is invisible until the join grain is finer than the thing
being counted, which is most of the time in report SQL.

The model answer uses `count(DISTINCT p.id)` and `count(r.id)`; the reference
counts the same things from the reviews side, to make the point that which
table you write first has no effect on the grain.

## ex2 - the dimension is a measure column

Nothing multiplies here, because the grouping column is `rating` and the
grain is still the review. `products` is present only to restrict the
population to one category.

The classic mistake is expecting `reviews` and `products` to be near each
other in size. They are not: every book product receives ratings of all five
values, so the distinct product count per rating is close to the total number
of book products while the review count is twenty times larger. Reading that
shape correctly is a good check that you understand what you grouped.

The model answer joins and filters; the reference uses `IN (SELECT id FROM
products WHERE category = 'books')`, which is the semi-join spelling and
avoids widening the row before aggregating it.

## ex3 - two aggregates with no join key

Signups and orders have no row-level relationship. There is no join between
`customers` and `orders` that answers this question - trying one produces a
number that means "orders placed by customers who signed up in this month",
which is a cohort metric and a different report.

The classic mistake is exactly that: joining on `customer_id` and grouping by
one of the two timestamps. It runs, it produces eleven rows, and it answers
something nobody asked.

The model answer aggregates each table to one row per month and joins on
`month`. It uses an inner join because both tables have rows in every month
of the range; if either could be empty for a month, this would need a `FULL
JOIN` and a `coalesce` on the key. The reference tags rows from both tables
into one stream with `UNION ALL` and separates them again with `FILTER`,
which is a neat trick when the two sources share a shape.

## ex4 - the fan-out, at full strength

Sales and reviews both hang off `products`. Joined together, each sales line
is repeated once per review - about a hundred times here - so `units` and
`revenue` come out roughly a hundred times too large while `avg_rating`
remains exactly correct.

The classic mistake is `sum(DISTINCT oi.quantity)`, offered as the fix by
analogy with `count(DISTINCT ...)`. It is not a fix: it adds up the distinct
*values*, so two lines of 3 units become 3 and a product that sold quantities
1 through 5 reports 15 regardless of how many lines there were. There is no
aggregate that recovers a true sum from a multiplied join.

The model answer builds one CTE per branch, each grouped by category, and
joins the two six-row summaries. The reference does the sales side as a
two-stage rollup - per product, then per category - which is the shape you
end up with when the per-product numbers are also needed elsewhere.

## ex5 - two dimensions, one fan-out

The grouping columns come from two different tables and the measures from the
line between them. Revenue is at line grain and is correct as a plain sum;
the order count is not, because an order with three books contributes three
rows to the `('books', 'paid')` group.

The classic mistake is `count(*)`, which counts qualifying lines and labels
them orders. The number is always at least as large as the truth and looks
entirely reasonable, which is why nobody catches it.

The model answer uses `count(DISTINCT o.id)`. The reference collapses to one
row per `(order, category)` first and then counts rows, which is the same
idea done structurally: once the grain matches the thing you are counting,
`count(*)` is correct again and no `DISTINCT` is needed.

## ex6 - the same problem, one grain finer

Per product rather than per category, so the two branches must be summarised
per product before they touch `products`. After that both joins are
one-to-one and nothing can multiply.

The classic mistake is `coalesce(avg_rating, 0)`. Units and review counts
become zero because a product that never sold really did sell zero. An
average over no ratings is undefined, and turning it into 0 puts an unreviewed
product at the bottom of every ranking - a report that invents unanimous
one-star hatred out of silence.

The model answer left-joins two pre-aggregated subqueries and coalesces
exactly two of the three measures. The reference pushes the product filter
down into both subqueries so they aggregate a few thousand rows instead of a
million - worth noticing, because the naive version does the whole table's
work to answer a question about fourteen products.

## ex7 - the measure is the filter

`count(DISTINCT p.category)` appears twice: once as the output column, once
in `HAVING`. That repetition is not a smell, it is the rule - `HAVING` runs
before the `SELECT` list is evaluated, so it cannot see the alias.

The classic mistake is `WHERE count(...) >= 3`, which Postgres rejects
because aggregates do not exist at `WHERE` time. The second is `count(DISTINCT
p.id) >= 3` - distinct *products*, not categories - which passes silently and
answers a much easier question.

The model answer groups the four-table join and filters with `HAVING`. The
reference reduces to `SELECT DISTINCT customer_id, category` first, which
makes each pair one row and turns the whole thing into a plain `count(*)`.
That shape is faster and, more importantly, it is self-documenting: the
intermediate result is literally the list of customer-category pairs.

## ex8 - four aggregates and one row-valued answer

Revenue, units and order count are aggregates of the country group.
`top_product` is not - it is a name belonging to one specific row, and no
aggregate function can produce it. That split is the whole design of the
query.

The classic mistake is `max(p.name)`, which Postgres happily accepts and
which returns the alphabetically last product name in the country. It is
wrong on nearly every row and the report gives no sign of it.

The model answer builds the joined line rows once in a CTE and aggregates
that CTE twice: by country for the totals, and by country and product for the
ranking, from which `DISTINCT ON (country)` takes the winner. The reference
does the ranking with `row_number() OVER (PARTITION BY country ORDER BY
sum(q) DESC, product_id)` - note the aggregate inside the window's `ORDER BY`,
which is legal because window functions are evaluated after grouping, and is
the trick that lets you rank groups without an extra subquery level. Either
way, the `product_id` tie-break is what makes the answer the same on every
run.

## Further reading

- [PostgreSQL - Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - `count(DISTINCT ...)` versus `count(...)`, and the exact meaning of `sum(DISTINCT ...)` that makes it the wrong repair in ex4.
- [PostgreSQL - WITH Queries (CTEs)](https://www.postgresql.org/docs/16/queries-with.html) - the mechanism behind "summarise each branch, then join the summaries", used in ex3, ex4, ex7 and ex8.
- [PostgreSQL - GROUP BY and HAVING](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-GROUP) - why `HAVING` cannot see `SELECT` aliases and why aggregates are illegal in `WHERE`. Behind ex7.
- [PostgreSQL - Window Function Calls](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS) - that window functions run after grouping, which is what allows `row_number() OVER (ORDER BY sum(q) DESC)` in the ex8 reference.
- [PostgreSQL - COALESCE](https://www.postgresql.org/docs/16/functions-conditional.html#FUNCTIONS-COALESCE-NVL-IFNULL) - the function at the centre of the zero-versus-NULL decision in ex6.
