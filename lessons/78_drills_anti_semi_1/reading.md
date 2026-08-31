# Reading - 78_drills_anti_semi_1

Semi-joins and anti-joins: filtering one table by whether a matching row
exists somewhere else, without letting that somewhere else into your result.

## Notes

**A semi-join filters; it does not multiply.** "Customers who have bought a
book" is a question about `customers`, and the answer has exactly one row per
customer. A plain join answers a different question - it returns one row per
*book line* - and people patch it with `DISTINCT`. That works, but it means
building a large intermediate result and then throwing most of it away.
`EXISTS` stops at the first match and never produces the duplicates in the
first place.

**An anti-join is the same thing negated,** and it has three spellings in
PostgreSQL: `NOT EXISTS (correlated subquery)`, `LEFT JOIN ... WHERE right.key
IS NULL`, and `NOT IN (subquery)`. The first two are equivalent and safe. The
third is not.

**`NOT IN` with a NULL in the list can never be true.** `x NOT IN (a, b,
NULL)` expands to `x <> a AND x <> b AND x <> NULL`, and the last conjunct is
unknown rather than false - so the whole expression is unknown for every row,
and `WHERE` keeps nothing. It fails silently: no error, no warning, just an
empty result that looks like "there are none". Whenever the subquery selects
a nullable column, use `NOT EXISTS` instead, or add `WHERE col IS NOT NULL`
inside the subquery.

**`EXISTS` is not fooled by NULLs** because it never compares values across
the boundary - it asks whether the correlated subquery produced any row at
all, and a row that fails to match simply is not produced. This is the reason
to reach for it by default rather than as a repair.

**Two conditions of opposite sign need two subqueries.** "Has ordered but
never bought electronics" cannot be a join plus a filter, because the
customer's book order would satisfy the filter on its own. One `EXISTS` and
one `NOT EXISTS`, each correlated, each independent.

**SQL has no `FOR ALL`, so you write it as a double negative.** "Every line
has quantity 5" becomes "no line has a quantity other than 5" - plus a
separate check that there is at least one line, because "no line disagrees"
is vacuously true for an order with nothing in it. That vacuous-truth footnote
is the part interviewers actually probe.

**Anti-joins and outer joins are the same operation seen twice.** The
`LEFT JOIN ... IS NULL` spelling literally keeps the NULL-extended rows the
previous two drill sets were about, and throws away the matches. If you can
see that, you understand both.

## ex1 - the absence of a particular kind of row

"Never placed a paid order" is not "has no orders" - a customer with three
cancelled orders qualifies, and so does a customer with none. The condition
lives entirely inside the absence.

The classic mistake is `LEFT JOIN orders o ON o.customer_id = c.id WHERE
o.status <> 'paid' ...`, which finds customers who have *some* non-paid
order, a completely different set. If the status test is going to live in a
join at all, it has to be in the `ON` clause, and then the surviving
condition is `o.id IS NULL`.

The model answer is `NOT EXISTS` with both the correlation and the status
inside the subquery; the reference shows the anti-join spelling, with
`o.status = 'paid'` in the `ON` and `o.id IS NULL` in the `WHERE`.

## ex2 - the semi-join, and why DISTINCT is a patch

An Indian customer who has bought forty books is still one customer. Joining
`customers` to `orders` to `order_items` to `products` produces forty rows
for them, and `DISTINCT` collapses those back to one - correct, but the
duplicates were created only to be destroyed.

The classic mistake is forgetting the dedup entirely and reporting a customer
list with repeats. The subtler one is deduping with `GROUP BY c.id, c.name`,
which works and quietly tells a reader that you meant to aggregate something.

The model answer is a single `EXISTS` whose subquery does the whole
three-table walk. The planner turns it into a hash semi-join, which stops
scanning a customer's lines as soon as one matches.

## ex3 - the absence is described by two tables

A sale disqualifies a product only if it was quantity 5 **and** the order
fell in the window. Both halves belong inside the `NOT EXISTS`; pulling
either one out into the outer `WHERE` changes the meaning completely, because
then you are testing a property of the product rather than of the sale.

The classic mistake is the anti-join written carelessly: `LEFT JOIN
order_items oi ON oi.product_id = p.id AND oi.quantity = 5 LEFT JOIN orders o
ON o.id = oi.order_id WHERE o.created_at >= '2023-11-01' AND ...`. Once the
date test is in `WHERE`, the NULL-extended rows you were about to detect are
already gone.

The model answer correlates a two-table `NOT EXISTS`; the reference builds
the disqualified product ids as one `DISTINCT` subquery, left-joins that, and
keeps the misses - which is the shape to use when the same exclusion list is
needed twice.

## ex4 - the NOT IN trap, on purpose

`SELECT ... FROM staff s WHERE s.id NOT IN (SELECT manager_id FROM staff)` is
the sentence in English, it is what everybody writes, and it returns zero
rows. `staff.manager_id` is NULL for the CEO, and `NOT IN` against a list
containing NULL is unknown for every candidate row.

The classic mistake is not the query, it is the diagnosis: an empty result
reads as "there are no such rows", which is a plausible answer, so people
accept it. That is what makes this the most dangerous construct in the
language - it does not fail, it lies.

The model answer is `NOT EXISTS (SELECT 1 FROM staff r WHERE r.manager_id =
s.id)`. It is immune because it never compares a value to NULL across the
boundary; a row whose `manager_id` is NULL simply does not match, and not
matching is exactly what the subquery is looking for. The reference uses the
`LEFT JOIN ... WHERE r.id IS NULL` self anti-join, equally safe. If you are
attached to `NOT IN`, the repair is `WHERE manager_id IS NOT NULL` inside the
subquery - and having to remember that is the argument for not using it.

## ex5 - one presence, one absence

Two requirements pointing in opposite directions about the same customer.
Neither can be a join with a filter: a customer who bought a novel and a
laptop has an order row where `category <> 'electronics'`, so any
filter-based attempt lets them through.

The classic mistake is dropping the `EXISTS` half. Customers who have never
ordered anything have certainly never ordered electronics, so `NOT EXISTS`
alone returns them too - and they are not the people the report is about.
Whenever an anti-join answers a business question, ask whether "did nothing
at all" should count.

The model answer is `EXISTS (orders)` and `NOT EXISTS (orders -> lines ->
products with category 'electronics')`, both correlated on the customer, both
in the outer `WHERE`. The reference does it with joins: an inner join to the
distinct set of customers who ordered, and a left anti-join against the
distinct set who bought electronics.

## ex6 - same table, both signs

Both conditions read `reviews`, in the same window, differing only in the
rating. That is precisely why they cannot share a join: a single joined row
can testify that *this* review is a five, but it can say nothing at all about
whether some other review is a one.

The classic mistake is `WHERE r.rating = 5 AND r.rating <> 1`, which is just
`rating = 5` with extra words. Any condition of the form "no row of this kind
exists" needs its own subquery; conditions about a single row can share one.

The model answer pairs `EXISTS (... rating = 5 ...)` with `NOT EXISTS (...
rating = 1 ...)`, each carrying the date window. The reference joins the
distinct set of well-reviewed products and left-anti-joins the badly-reviewed
one, which makes the two populations visible as sets and is easier to extend
to a third rating.

## ex7 - churn is an anti-join with a calendar

Active in October, silent afterwards. Two windows over the same table, one
`EXISTS` and one `NOT EXISTS`, and the only real subtlety is the boundaries:
use half-open ranges so that an order at exactly midnight on 1 November
belongs to exactly one window.

The classic mistake is `BETWEEN '2023-10-01' AND '2023-11-01'`, which is
inclusive at both ends and puts that midnight order in both windows - so a
customer who ordered only then counts as both active and churned. With
`timestamptz` columns, half-open is the only boundary convention that never
needs a special case.

The model answer uses the two correlated subqueries. The reference shows the
set-operation route - October customer ids `EXCEPT` November customer ids -
which deduplicates for free and is often the clearest way to express a churn
or diff report.

## ex8 - "every" is "not any, of the opposite"

There is no `FOR ALL` in SQL, so "every line has quantity 5" has to be
rewritten as "no line has a quantity other than 5". That rewrite is
mechanical once you have seen it, and it is asked in interviews constantly.

The classic mistake is the vacuous case. `NOT EXISTS (line with quantity <>
5)` is true for an order with no lines at all - nothing disagrees, because
nothing is there - so those orders sail into the result. The second condition,
`EXISTS (any line)`, is what the prompt means by "at least one line", and
being the person who notices that unprompted is worth a lot.

A subtler version of the same mistake is `NOT EXISTS (line with quantity <>
5)` where `quantity` could be NULL: `NULL <> 5` is unknown, so a NULL line
would not disagree either. It cannot happen here - `order_items.quantity` is
`NOT NULL` - but the reasoning is the same one that makes `NOT IN` dangerous,
and it is worth carrying.

The model answer uses the two subqueries. The reference takes the aggregate
route: group the lines by order and keep the groups where the count of
offending lines is zero, which handles "at least one line" automatically
because a group cannot exist without a row in it.

## Further reading

- [PostgreSQL - Subquery Expressions: EXISTS, IN, NOT IN](https://www.postgresql.org/docs/16/functions-subquery.html) - the definitive statement that `NOT IN` yields NULL when the subquery produces a NULL, and the note recommending `NOT EXISTS` instead. Read the `NOT IN` paragraph twice; it is ex4 in one sentence.
- [PostgreSQL - Comparison Functions and Operators](https://www.postgresql.org/docs/16/functions-comparison.html) - three-valued logic, `IS DISTINCT FROM`, and why `x <> NULL` is unknown rather than true.
- [PostgreSQL - Joined Tables](https://www.postgresql.org/docs/16/queries-table-expressions.html#QUERIES-JOIN) - the outer-join semantics that make the `LEFT JOIN ... IS NULL` anti-join work, and why the extra predicate has to be in `ON`.
- [PostgreSQL - Combining Queries: UNION, INTERSECT, EXCEPT](https://www.postgresql.org/docs/16/queries-union.html) - the set-operation spelling of an anti-join, used in the ex7 reference, and its automatic deduplication.
- [Use The Index, Luke - Semi-joins and anti-joins](https://use-the-index-luke.com/sql/where-clause/searching-for-ranges) - how these shapes are executed and indexed, which is why `EXISTS` costs no more than a join despite reading like a loop.
