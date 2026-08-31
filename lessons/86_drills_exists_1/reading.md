# Reading - 86_drills_exists_1

Eight drills on "at least one" and "none at all". Read after your attempt,
pass or fail.

## Notes

`EXISTS (subquery)` asks a yes/no question and stops reading the moment it
finds a first row, which is why the body is conventionally `SELECT 1` - the
selected value is never looked at. Its real importance is that the planner
recognises the shape: a correlated `EXISTS` in `WHERE` becomes a **semi-join**
and a correlated `NOT EXISTS` becomes an **anti-join**, both of which can be
executed as a single hash join over the whole table instead of one scan per
outer row. That is the difference between the two-second queries in this set
and the twenty-minute ones. The transformation only happens when the `EXISTS`
sits where a join can be pulled up - a plain `WHERE` conjunct. Move the same
expression into an aggregate's `FILTER` clause or a `CASE`, and it reverts to
a per-row SubPlan, so put it in `WHERE` whenever you can and aggregate
afterwards. The other half of this set is `NOT IN`, which looks like a synonym
for `NOT EXISTS` and is not: `IN` and `NOT IN` are shorthand for `= ANY` and
`<> ALL`, so a single `NULL` anywhere in the subquery's output turns every
`NOT IN` test into `NULL`, which `WHERE` discards.

## ex1 - a yes/no column

`EXISTS` returns a boolean value, and PostgreSQL treats booleans as ordinary
data, so nothing stops one appearing in the `SELECT` list next to `name` and
`salary`. The classic mistake is computing the flag with a correlated
`count(*) > 0`, which is correct but must count every matching row before
deciding, where `EXISTS` stops at the first. The reference deliberately uses
the other spelling - a `LEFT JOIN` plus `count(r.id) > 0` - to show that the
grouped form needs every output column repeated in `GROUP BY`.

## ex2 - never bought anything, by country

An anti-join followed by a grouping, which is the ordinary way to size a
population: find the rows that fail to match, then count them by whatever
dimension you care about. The classic mistake is trying to do it with a
`LEFT JOIN` and forgetting the `WHERE o.id IS NULL`, which counts orders
rather than customers and inflates every country. `NOT EXISTS` is immune to
that error because it never widens the row set in the first place.

## ex3 - the big spenders of the Philippines

The point of a semi-join is that it does not duplicate: a customer with nine
qualifying orders appears once, where an inner join to `orders` would return
them nine times and force a `DISTINCT`. Note that the two conditions inside
the `EXISTS` are conditions on the same order, so a customer with one
cancelled 1950-total order and one 20-total paid order does not qualify - a
distinction that a pair of separate `EXISTS` clauses would lose.

## ex4 - manage nobody, written with NOT IN

`x NOT IN (SELECT manager_id FROM staff)` expands to `x <> ALL (...)`, and
`404 <> NULL` is `NULL`, not `true`. `ALL` requires every comparison to be
true, so a single `NULL` in the list makes the whole test `NULL` for every
row, and the query returns nothing at all - no error, no warning, just an
empty result that looks like a data problem. Filtering the subquery with
`WHERE manager_id IS NOT NULL` fixes it; so does switching to `NOT EXISTS`,
which compares row by row and is never poisoned by a `NULL` it does not match.
Prefer `NOT EXISTS` in real code and keep this exercise as the reason why.

## ex5 - the cheapest thing in each category

"Cheapest" restated as "nothing cheaper exists" is the standard trick for
turning a superlative into an anti-join, and it has a property the `min()`
version does not: it returns every row tied for cheapest rather than one
arbitrary winner. The classic mistake is a strict `<` versus `<=` slip -
writing `t.price <= p.price` makes every row disqualify itself, and the answer
is empty. The reference shows the aggregate-and-join spelling, which is
usually the faster plan once an index exists.

## ex6 - praised but never sold

Two subqueries pulling in opposite directions across two different tables:
an anti-join against `order_items` and a semi-join against `reviews`. Both are
flattened into hash joins, so the query costs two passes over a
million-row table rather than one pass per product. The classic mistake is
writing the pair as one subquery with `AND` over a join of `order_items` and
`reviews`, which asks a subtly different and much weaker question - "no row
that is both an order item and a five-star review", which is true of
practically everything.

## ex7 - electronics, unaccompanied

The correlation here is two levels deep and the levels correlate on different
things: the outer `EXISTS` ties orders to the customer, and the inner
`NOT EXISTS` ties order items to that specific order. Writing both conditions
against the customer instead - "has bought electronics, has never bought
books" - answers a different question and returns a much smaller set. Getting
this right is mostly a matter of asking, for each subquery, "which row is this
one about?" and then correlating on that row's key.

## ex8 - managers of managers

Nesting `EXISTS` inside `EXISTS` is how you express a fixed-depth walk through
a hierarchy without recursion, and the pattern generalises to any "has a
grandchild" question. The classic mistake is the join spelling without
`DISTINCT`: joining `staff` to reports and then to their reports produces one
row per grandchild, so a manager with nine grandchildren appears nine times.
`EXISTS` collapses that automatically, which is exactly what a semi-join is
for. For an unbounded walk - all descendants, at any depth - you need the
recursive CTE of lesson 14, drilled in set 89.

## Further reading

- [Subquery Expressions](https://www.postgresql.org/docs/16/functions-subquery.html) - `EXISTS`, `IN`, `NOT IN`, `ANY` and `ALL`, including the paragraph on `NULL` that exercise 4 is built on.
- [Subquery flattening in `EXPLAIN`](https://www.postgresql.org/docs/16/using-explain.html) - how to recognise a Hash Semi Join and a Hash Anti Join in a real plan.
- [Joins Between Tables](https://www.postgresql.org/docs/16/tutorial-join.html) - the `LEFT JOIN ... IS NULL` spelling of an anti-join and why it duplicates when you are not careful.
- [Comparison Functions and Operators](https://www.postgresql.org/docs/16/functions-comparison.html) - three-valued logic, `IS DISTINCT FROM`, and what `WHERE` does with `NULL`.
