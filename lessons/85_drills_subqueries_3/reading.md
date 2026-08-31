# Reading - 85_drills_subqueries_3

Eight drills on scalar and correlated subqueries in positions other than a
plain `WHERE` filter. Read after your attempt, pass or fail.

## Notes

A subquery in parentheses that returns exactly one row and one column is a
**scalar subquery**, and PostgreSQL will let you write one anywhere a value is
legal: in the `SELECT` list, in `WHERE`, in `ORDER BY`, inside an expression,
even inside another subquery. The single question that decides everything
about its cost is whether it mentions a column from the outer query. If it
does not, it is uncorrelated: the planner evaluates it once, as an InitPlan,
and substitutes the answer everywhere. If it does, it is correlated, becomes a
SubPlan, and is re-executed once per outer row. That distinction is not
cosmetic on this dataset. `orders` and `reviews` carry no index on their
foreign keys here, so one correlated scan of `reviews` costs roughly a second;
twelve outer rows turn into twelve seconds, and ten thousand outer rows turn
into a query nobody will ever see finish. The rule that follows is the one
this set drills over and over: aggregate the big table down to something small
first, then correlate against the small thing. A scalar subquery that returns
no rows at all yields `NULL` rather than an error or a zero, which is a
feature in exercise 3 and a trap everywhere else.

## ex1 - measured against the boss

The subquery here names a single fact about the whole table - the CEO's salary
- so it mentions nothing from the outer query and PostgreSQL evaluates it
exactly once no matter how many engineers come back. The classic mistake is
reaching for a join to `staff` to fetch that one number, which works but
obscures the intent and invites a duplicate row if the join condition is ever
loosened. The reference shows the honest alternative: a one-row derived table
cross-joined in, which is the same plan with a different spelling.

## ex2 - each category's share of the catalog

The denominator cannot be an aggregate of the outer query, because the outer
query has already been cut into six groups and `count(*)` there means "in this
category". A subquery over the ungrouped table is one way out; the window
function `sum(count(*)) OVER ()` shown in the reference is the other, and it
reads the table once instead of twice. The classic mistake is writing
`100 * count(*) / (SELECT count(*) ...)` with integer arithmetic and getting a
column of zeros, which is why the prompt spells out the `100.0`.

## ex3 - the manager's manager

Two levels of correlation, one nested inside the other: the inner subquery
finds the manager's `manager_id`, the outer one turns that id into a name.
Because both are scalar subqueries, a missing row at either level produces
`NULL` and the staff row still appears - exactly the behaviour a `LEFT JOIN`
gives you, which is why the reference spells the same query with two left
joins. The classic mistake is using inner joins and silently losing the CEO
and their direct reports from the answer.

## ex4 - sorted by something you do not select

`ORDER BY` is evaluated after the `SELECT` list but is not restricted to it,
so a correlated subquery can decide the order of rows without ever appearing
in the output. This is genuinely useful - it keeps report columns clean - and
it is also the cheapest way to see that `ORDER BY` runs once per row like any
other expression. The classic mistake is assuming you must select a column to
sort by it, and padding the result with a count nobody asked for. The
reference reaches for the other spelling, a `LEFT JOIN` back to `staff` with
`ORDER BY count(...)`, which needs a `GROUP BY` over every selected column.

## ex5 - every order of the busiest customer

The inner query is a complete little report of its own - group, sort, take one
- and its single output value is then used as a constant by the outer query.
Because nothing correlates, it runs once. The classic mistake is trying to do
this in a single pass with `ORDER BY count(*) DESC LIMIT 1` on the outer query
itself, which returns one aggregated row rather than that customer's orders.
The prompt bans a hard-coded id for a reason: at `DOJO_SCALE=0.1` the
busiest customer is a different person, and a literal would pass here and fail
in CI.

## ex6 - better than the people who came before

The correlation is on two columns at once - same department, hired earlier -
which makes the subquery's result genuinely different for every outer row
rather than one of five departmental averages. The staff table is only 500
rows, so 500 re-executions of a 500-row scan is nothing; the same query
against `orders` would be a disaster. The classic mistake is forgetting that
`salary > NULL` is `NULL`, not `true`, and then being surprised that the
earliest hire in each department is missing - that is correct, and the
reference's inner-join-plus-`HAVING` spelling drops them for the same reason.

## ex7 - above your own country's average

This is the shape of the set: two nested correlated subqueries, both hanging
off a common table expression that has already collapsed 500,000 orders into
one row per customer. Correlating straight against `orders` would be the same
answer at a hundred times the cost. The classic mistake is comparing against
the rounded `avg_orders` column instead of the raw average - rounding is
presentation, and a comparison should use the value the database computed. The
reference joins a second CTE of per-country averages and counts with `FILTER`,
which is what you would ship.

## ex8 - orders and first-timers, month by month

PostgreSQL rejects a subquery that reads an ungrouped outer column, which is
why `date_trunc('month', o.created_at)` cannot be referenced from inside the
scalar subquery of a grouped query even though it happens to be the grouping
expression. Naming the monthly aggregate in its own CTE removes the problem
entirely and makes the query readable. The classic mistake is joining `orders`
to the first-order table directly, which multiplies each customer's first
order by their order count; the model answer counts customers in a separate
pass and only then lines the two series up by month.

## Further reading

- [Subquery Expressions](https://www.postgresql.org/docs/16/functions-subquery.html) - `EXISTS`, `IN`, `ANY`/`ALL` and the row-constructor forms, with their `NULL` behaviour spelled out.
- [Scalar Subqueries](https://www.postgresql.org/docs/16/sql-expressions.html#SQL-SYNTAX-SCALAR-SUBQUERIES) - the one-row/one-column rule and what happens when zero rows come back.
- [`SELECT`](https://www.postgresql.org/docs/16/sql-select.html) - clause evaluation order, and why `ORDER BY` may use expressions that are not in the select list.
- [Using `EXPLAIN`](https://www.postgresql.org/docs/16/using-explain.html) - how to tell an InitPlan (evaluated once) from a SubPlan (evaluated per row) in a real plan.
