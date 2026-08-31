# Reading - 77_drills_outer_joins_2

One rule, applied eight times: a predicate in `ON` decides what counts as a
match, a predicate in `WHERE` decides which rows you keep. For outer joins
those are different questions.

## Notes

**The evaluation order is the whole explanation.** Postgres evaluates the
`ON` condition first and pairs up whatever it can; then it manufactures a
NULL-extended row for every left row that found no partner; only then does
`WHERE` run. So a `WHERE` test on a right-hand column is applied to rows
where that column is NULL by construction - and `NULL = 'cancelled'` is not
true, so the row is dropped. Your outer join quietly became an inner join.

**Say what the predicate is about.** "Only cancelled orders count as a match"
belongs in `ON`. "Only customers who have a cancelled order" belongs in
`WHERE`. Both sentences are reasonable requirements and they have different
answers; the reason this is worth drilling is that the SQL for them differs
by four characters and reads almost identically.

**`FILTER` is the third option, and usually the best one.** When you want
several differently-restricted measures over the same group, moving the
restriction into the aggregate - `count(*) FILTER (WHERE ...)` - keeps one
join, one pass, and no risk of dropping rows. `CASE WHEN ... THEN` inside an
aggregate is the portable spelling of the same idea.

**You can outer-join to a joined result.** `LEFT JOIN (a JOIN b ON ...) ON
...` treats the pair as one unit: the NULL row appears when *the combination*
matched nothing. Chaining two joins one after another asks a different
question and gets a different answer. A subquery does the same job and is
easier to read.

**`FULL JOIN` means either side can be missing.** Everything you know about
`LEFT` applies twice, which has one specific consequence: the join key itself
can be NULL, so the key column in your `SELECT` list has to be rebuilt with
`coalesce(a.k, b.k)`. Forgetting that is the signature full-join bug.

**Aggregate before you outer-join when the right side is one-to-many and you
only care whether it exists.** Reducing it to one row per key first turns the
join one-to-one, which makes `count(*)` count what you think it counts and
`IS NULL` mean what you think it means.

## ex1 - the restriction that belongs in ON

The report is about Australian customers, all of them, and "cancelled" only
describes which of their orders should be counted. That is a statement about
matching, so it goes in the `ON` clause and the customers with nothing to
count survive with zero.

The classic mistake is `WHERE o.status = 'cancelled'`, which reads perfectly
and deletes every customer the outer join was protecting - including all the
ones with a clean record, which is precisely the population a churn or
quality report exists to show.

The model answer puts the status test in `ON` and counts `o.id`. The
reference gets there differently, by summarising cancelled orders per
customer first and left-joining the summary, which sidesteps the question
entirely - a good habit when a report grows past two measures.

## ex2 - the restriction that belongs in WHERE

Now the requirement really is "customers who have at least one cancelled
order", and that is a statement about which customers you keep. An inner join
says it directly and needs no ceremony.

The classic mistake here is the mirror image of ex1: reflexively writing
`LEFT JOIN` because the previous problem needed one. It is not wrong - the
reference solution shows that `LEFT JOIN` with the status test in `WHERE`
gives exactly this answer - but it is misleading code, because a reader has
to work out that the outer join is decorative.

The model answer is a plain inner join with both predicates in `WHERE`. Run
it next to ex1 and compare the row counts: the difference is the population
that only ex1 can see.

## ex3 - three subsets, one join

Once a report needs several measures over different slices of the same group,
joining once per slice stops scaling and joining with a `WHERE` stops being
correct. `FILTER` restricts an individual aggregate to part of the group and
leaves the group itself alone.

The classic mistake is forgetting that the revenue column needs `coalesce`
while the counts do not. `count(...)` over an empty subset is 0; `sum(...)`
over an empty subset is NULL. The two behave differently on purpose - zero
things counted is genuinely zero, whereas the sum of no numbers is genuinely
undefined - and a report that prints NULL where the business expects 0.00 is
a bug report waiting to happen.

The model answer uses one `LEFT JOIN` and three aggregates, two of them
filtered. The reference writes the same thing with `CASE` expressions inside
the aggregates, which is what you use on engines without `FILTER`.

## ex4 - outer-joining to a joined result

"An order with no line for an expensive product" is a condition about the
combination of `order_items` and `products`, not about either one alone. Join
them first, then outer-join the pair.

The classic mistake is `LEFT JOIN order_items ... LEFT JOIN products ... AND
p.price > 400`. That gives an order with three cheap lines three rows with
NULL product names, instead of the one row the prompt asks for - the
NULL-extension happened at the wrong level. The other classic mistake is
making the second join inner, which deletes every order whose lines are all
cheap.

The model answer wraps the inner join in parentheses and outer-joins the
whole thing; the reference builds the expensive lines in a subquery and
outer-joins that. They are the same query with different punctuation, and the
subquery version is the one to write when somebody else has to read it.

## ex5 - one table, two joins, doubled counts

Attaching `orders` twice under two aliases is a legitimate way to ask for two
disjoint subsets, and it comes with an immediate cost: a customer with 5 paid
and 2 cancelled orders produces 10 rows, so both plain counts report 10. The
number is wrong by exactly the size of the *other* subset, which makes it
plausible enough to ship.

The classic mistake is trusting the totals. The tell is that both columns
show the same value on every row - a strong hint that you are counting the
cross product rather than either branch.

The model answer repairs it with `count(DISTINCT p.id)` and `count(DISTINCT
x.id)`. The reference avoids the situation altogether with a single join and
two `FILTER`ed counts, which is faster, shorter and the answer to give when
an interviewer asks how you would add a third status.

## ex6 - reduce the right side before joining it

There are far more order lines than there are products, so joining them
directly produces one row per line, in which `count(*)` counts lines. The
question is about products, so the right side has to be collapsed to one row
per product before it touches `products`.

The classic mistake is `LEFT JOIN order_items oi ON oi.product_id = p.id ...
WHERE oi.id IS NULL` combined with a `count(*)`: the `WHERE` version answers
"how many never-ordered products" but cannot also report the category total
in the same pass, and people then write two queries and join them by hand.

The model answer left-joins `SELECT DISTINCT product_id FROM order_items`,
which makes the join one-to-one, so `count(*)` counts products and
`s.product_id IS NULL` marks the unsold ones. The reference does the same
with `GROUP BY` instead of `DISTINCT` and computes the second number by
subtraction - `count(*) - count(s.product_id)` - which is the same
`count(*)`-versus-`count(col)` distinction from the previous drill set, used
deliberately this time.

## ex7 - NULL-extension meets FILTER

Two chained outer joins, each carrying a restriction in its `ON` clause, and
a `FILTER` on top. The interesting case is a product whose only quantity-5
line sits on an October order: the line survives the first join, the order is
NULL-extended by the second, and `o.status <> 'cancelled'` evaluates to NULL.

The classic mistake is expecting that row to land in `good_units` because
"it wasn't cancelled". `FILTER` keeps rows where the condition is **true**,
and NULL is not true, so the row contributes to neither bucket - which is the
right answer, because an order outside the window should not be counted at
all. Three-valued logic doing exactly what you want, for once.

The model answer chains the two outer joins, splits with `FILTER`, and
`coalesce`s both sums. The reference computes the whole sales side in one
pre-filtered subquery and left-joins it, which makes the window explicit
instead of implicit - usually the clearer choice when the window is a
business rule rather than a technicality.

## ex8 - the full outer join

Some products sold in the last two days without being praised; others were
praised without selling. Neither one-sided join can produce both groups, and
`UNION`ing two left joins duplicates the overlap. `FULL JOIN` is the operator
built for this.

The classic mistake is selecting `s.product_id` as the key. On a praise-only
row that column is NULL, so the report shows a NULL product id next to a real
review count. `coalesce(s.product_id, r.product_id)` is not optional
decoration - in a full join, the key belongs to whichever side turned up.

The second classic mistake is labelling the buckets by testing the measures
(`WHERE units IS NULL`) rather than the keys. That conflates "this side had
no row" with "this side had a row whose value was NULL", and preserving that
distinction is most of the reason full joins exist.

The model answer aggregates both sides to one row per product, full-joins the
summaries, rebuilds the key with `coalesce`, and labels with a `CASE` over
the two key columns. The reference reaches the same result by building the
union of the two key sets first and left-joining both summaries onto it -
more verbose, completely portable, and the version to fall back on when a
full join's NULL bookkeeping starts to hurt.

## Further reading

- [PostgreSQL - Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) - the paragraph stating that the `ON` condition is applied before NULL-extension and `WHERE` after it. This is the whole lesson in one sentence.
- [PostgreSQL - Aggregate Expressions and FILTER](https://www.postgresql.org/docs/16/sql-expressions.html#SYNTAX-AGGREGATES) - the exact semantics of `FILTER (WHERE ...)`, including that only rows where the condition is true are fed to the aggregate. Behind ex3, ex5 and ex7.
- [PostgreSQL - Comparison Functions and Operators](https://www.postgresql.org/docs/16/functions-comparison.html) - three-valued logic, and why a comparison against a NULL-extended column is neither true nor false. The mechanism behind the ex7 surprise.
- [PostgreSQL - Subqueries in FROM](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-SUBQUERIES) - pre-aggregating a one-to-many side so the outer join becomes one-to-one, used in ex4, ex6 and ex8.
- [Modern SQL - FULL OUTER JOIN](https://modern-sql.com/feature/full-outer-join) - what full joins are for, the `coalesce` on the key, and how to emulate them where they are missing.
