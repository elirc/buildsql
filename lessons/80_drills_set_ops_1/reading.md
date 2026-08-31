# Reading - 80_drills_set_ops_1

`UNION`, `INTERSECT`, `EXCEPT`: three operators, one duplicate rule, and one
precedence rule that catches everybody once.

## Notes

**Set operators work on whole rows, not on columns.** Both branches must
produce the same number of columns with compatible types, and two rows are
"the same" only when every column matches. That is why a two-column `EXCEPT`
removes a `(customer, status)` pair rather than a customer - a distinction
worth stating out loud before you write one.

**Bare means distinct; `ALL` means keep everything.** `UNION`, `INTERSECT`
and `EXCEPT` all deduplicate by default, which is genuinely convenient and
genuinely expensive: the database has to sort or hash the entire result to
find the duplicates. `UNION ALL` just concatenates. If you know the branches
are disjoint, `UNION ALL` is free correctness plus free speed.

**`EXCEPT ALL` is multiset subtraction.** For each value it keeps
`max(0, left_count - right_count)` copies. Plain `EXCEPT` collapses each
value to one and then deletes it entirely if it appears on the right even
once. These are different questions: "which orders have no counterpart" versus
"which customers appear only on the left".

**Set operators are anti-joins and semi-joins in disguise.** `A EXCEPT B` is
an anti-join, `A INTERSECT B` is a semi-join, and both dedupe on the way out.
Which spelling to use is a readability decision, not a correctness one - with
one exception: `EXCEPT` compares whole rows, so where a `NOT EXISTS` would
need three correlated conditions, `EXCEPT` needs none.

**`ORDER BY` and `LIMIT` belong to the whole statement.** Written after the
last branch, they apply to the combined result, not to that branch - and the
column names available to sort by come from the **first** branch. If a query
needs a sort or limit inside one branch, that branch has to be parenthesised
or moved into a subquery.

**`INTERSECT` binds tighter than `UNION` and `EXCEPT`.** `A UNION B INTERSECT
C` means `A UNION (B INTERSECT C)`. This is the arithmetic precedence rule
applied to sets, it is in the standard, and it produces a query that runs
happily and answers something you did not ask. Parenthesise whenever you mix
operators, even when you are sure.

## ex1 - UNION deduplicates

Two overlapping populations, one list. `UNION` concatenates and then removes
duplicate rows, so a Mexican customer who also signed up early appears once.

The classic mistake is `SELECT DISTINCT ... UNION SELECT DISTINCT ...`, which
is harmless but shows the deduplication was not understood; `UNION` already
does it across the combined result, and per-branch `DISTINCT` cannot achieve
that. The other mistake is putting an `ORDER BY` on the first branch, which is
a syntax error in this position for good reason - there is nothing meaningful
it could order.

The model answer is a two-branch `UNION` with one trailing `ORDER BY`. The
reference collapses the whole thing into a single scan with `OR` and
`DISTINCT`, which is what the planner effectively does anyway when both
branches read the same table, and is the version to prefer in that case.

## ex2 - UNION ALL keeps them

Same data, one keyword different, and the row count grows by exactly the size
of the overlap. Running ex1 and ex2 back to back is the cheapest possible
demonstration of what `UNION` costs and what it buys.

The classic mistake is defaulting to `UNION` everywhere. On disjoint branches
- which is most real cases, since people usually union things that cannot
overlap - the deduplication pass is pure waste, and on large results it is the
dominant cost of the query.

The model answer uses `UNION ALL`. The reference wraps the union in a
subquery and sorts outside it, which is worth seeing once: it makes explicit
that the `ORDER BY` was never part of either branch.

## ex3 - INTERSECT is a semi-join

Two sets computed by completely different routes - one through orders and
lines, one through reviews - and you want their overlap. `INTERSECT` compares
the two result sets directly, so neither branch needs to know anything about
the other.

The classic mistake is joining the two branches on `product_id` instead. That
works, but a product with three bulk lines and two complaints then produces
six rows, and you are back to needing `DISTINCT`. `INTERSECT` deduplicates on
both sides as part of its definition.

The model answer is a straight `INTERSECT`. The reference asks the same
question of `products` with two `EXISTS` subqueries - usually faster when the
driving table is small and indexed, and the more natural shape when you also
need columns like the product's name, which a set operator cannot give you
without another join.

## ex4 - EXCEPT is an anti-join

Everything reviewed, minus everything sold. The answer is the products that
exist and have opinions attached but have never appeared on an order - and
`EXCEPT` finds them with no join at all.

The classic mistake is `NOT IN (SELECT product_id FROM order_items)`, which
would be safe here only because that column is `NOT NULL`. Relying on that is
a habit that eventually meets a nullable column and returns silently empty -
lesson 05, and drill set 78 ex4.

The model answer is a two-line `EXCEPT`. The reference uses `NOT EXISTS` with
an explicit `DISTINCT`, which is what you would write if you also needed the
review count or the product name in the same query.

## ex5 - set operators compare whole rows

Two columns per branch, and the removal rule is "both match". A customer with
a `paid` order in October and a `cancelled` order in November keeps their
`(customer, 'paid')` pair, because that exact pair does not appear on the
right.

The classic mistake is reading the query as if it removed customers. It does
not: it removes pairs. Expressing the same thing with `NOT EXISTS` makes the
danger obvious, because you have to write both correlated conditions by hand
and it is easy to write only one.

The model answer is a two-column `EXCEPT`. The reference is the `NOT EXISTS`
version with both conditions spelled out, and comparing the two is the point
- the set operator is shorter precisely because the whole-row comparison is
built in.

## ex6 - EXCEPT ALL counts copies

`EXCEPT ALL` is the operator people forget exists, and it answers a question
plain `EXCEPT` cannot: how many October orders are left over after pairing
each one off against a November order from the same customer.

The classic mistake is expecting `EXCEPT` to do this and being surprised that
active customers disappear entirely. `EXCEPT` is about membership; `EXCEPT
ALL` is about counts. Say which one the business question is asking for
before you choose.

The model answer is a four-line `EXCEPT ALL`. The reference implements the
same semantics by hand - count each side, subtract, and expand the difference
back into rows with `generate_series` - which is worth reading once because it
makes the `max(0, left - right)` rule concrete.

## ex7 - the ORDER BY belongs to the whole thing

A single `ORDER BY id LIMIT 10` after the last branch sorts and truncates the
combined, deduplicated result. Attach either to a branch and you get the ten
smallest of that branch, unioned with all of the other - a different answer
that is easy to produce by accident.

The classic mistake is `ORDER BY customer_id`. The output column names come
from the first branch, so after `SELECT id ... UNION SELECT customer_id ...`
the column is called `id` and nothing else will resolve. Postgres will tell
you so, which is the good outcome; the bad outcome is when both branches
happen to have the same column names and you sort by the wrong one without
noticing.

The model answer relies on the trailing clauses applying to the whole
statement. The reference wraps the union in a subquery - more typing, no
ambiguity, and the version to write when somebody else maintains the query.

## ex8 - precedence, the one that gets everybody

`A UNION B INTERSECT C` is parsed as `A UNION (B INTERSECT C)`, exactly as
`1 + 2 * 3` is `1 + (2 * 3)`. The query runs, returns a plausible number of
rows, and answers "products with a recent complaint, plus toys that had a
recent bulk sale" instead of "toys with either".

The classic mistake is trusting left-to-right reading. Set operators are not
evaluated in written order, and the failure is invisible: no error, no
warning, just a result set that is too big and looks fine. The habit worth
building is to parenthesise every mixed expression, even when the precedence
happens to be on your side.

The model answer parenthesises the `UNION` and intersects the whole thing
with the toys. The reference sidesteps set operators entirely - a `WHERE` on
`products` with two `EXISTS` subqueries joined by `OR` - which is both faster
here and immune to the precedence question. When a set expression starts
needing parentheses to be readable, that is usually the signal to rewrite it
as predicates on one driving table.

## Further reading

- [PostgreSQL - Combining Queries (UNION, INTERSECT, EXCEPT)](https://www.postgresql.org/docs/16/queries-union.html) - the duplicate rules, the `ALL` variants, and the sentence stating that `INTERSECT` binds more tightly than the other two. Behind every exercise here, and ex8 in particular.
- [PostgreSQL - SELECT: UNION / INTERSECT / EXCEPT clause](https://www.postgresql.org/docs/16/sql-select.html#SQL-UNION) - the exact `max(0, m - n)` definition of `EXCEPT ALL` and its `INTERSECT ALL` counterpart. Behind ex6.
- [PostgreSQL - SELECT: ORDER BY and LIMIT with set operations](https://www.postgresql.org/docs/16/sql-select.html#SQL-ORDERBY) - why the sort applies to the whole statement and why the column names come from the first branch. Behind ex7.
- [PostgreSQL - Subquery Expressions](https://www.postgresql.org/docs/16/functions-subquery.html) - the `EXISTS` / `NOT EXISTS` spellings that the reference solutions use as the alternative to `INTERSECT` and `EXCEPT`.
- [Modern SQL - UNION, INTERSECT, EXCEPT](https://modern-sql.com/feature/intersect-except) - support and quirks across engines, useful because `EXCEPT` is spelled `MINUS` in some of them.
