# Reading - 72_drills_group_having_3

Eight drills on filtering groups. Read after your attempt, pass or fail.

## Notes

`HAVING` is `WHERE` for groups, and everything follows from when it runs. It
comes after the aggregates are computed, so it can test them - and it cannot
see the SELECT list's aliases, because those are evaluated later, which is
why every condition here repeats its aggregate in full. It can also test
aggregates that never appear in the output: `HAVING max(price) > 499.5` is
perfectly legal in a query that selects only the category and a count, and
that is often the clearest way to express "categories that contain at least
one very expensive product". The rule that decides which clause a condition
belongs to is the only rule you need: if the condition can be evaluated by
looking at one row on its own, it belongs in `WHERE`; if answering it
requires looking at the whole group, it belongs in `HAVING`. Getting that
wrong is not always an error - sometimes it is a silently different question,
which is worse - and the cost when both work is that `HAVING` does the work
first and throws it away afterwards.

## ex1 - the groups of size one

Group-size filters find duplicates (`HAVING count(*) > 1`) and singletons
(`= 1`), and they are the standard tool for auditing a supposedly unique
column. The detail worth stating out loud is the one in Hint 2: this query
cannot see the orders with zero lines, because `GROUP BY` only forms groups
from rows that exist. Finding those requires an outer join from `orders`,
which is exercise 8 of lesson 67 and the anti-join drill in 66.

## ex2 - HAVING on a minimum

"No row in this group violates X" is a minimum or maximum test in `HAVING`,
and it is the group-level equivalent of a universal quantifier - there is no
`FOR ALL` in SQL, so you express it as a bound on an extreme. The classic
mistake is the `WHERE` version, which quietly changes the question from "does
this category contain a cheap product" to "ignoring the cheap products, what
does this category look like", and always returns every category.

## ex3 - HAVING on a sum

The threshold-on-a-sum query is how every "top account" and "VIP" segment
gets defined, and the pairing with a `WHERE` clause is what makes the
definition precise: spend means paid spend here, so cancelled orders never
enter the sum. Try moving `status = 'paid'` into `HAVING` once, in the lab -
the error message names the grouping rule and is worth reading, because it is
the same message you will get for a dozen different mistakes.

## ex4 - filter the rows, threshold the group

The interaction to see here is that `count(*)` in both `HAVING` and `ORDER
BY` counts post-`WHERE` rows, so the same expression means "five-star
reviews" rather than "reviews" throughout the query. Writing `count(*)
FILTER (WHERE rating = 5)` with no `WHERE` clause would give the same
numbers for the products that qualify but would also form a group for every
product with no five-star reviews at all - a different result set, and a
slower one.

## ex5 - two conditions on one group

Multi-condition group filters are ordinary boolean logic; the only novelty is
that each operand is an aggregate. The reference solution shows the
alternative worth having in your hands: compute the aggregates once in a CTE,
then filter them with a plain `WHERE`. That version reads better as the
conditions multiply, it lets you name the intermediate values, and it is
exactly what you will reach for when the threshold itself has to be computed
from the data.

## ex6 - an aggregate that never reaches the output

`HAVING` is not restricted to the aggregates you display, and remembering
that keeps result sets narrow: the question "which categories have a
flagship product" needs no price column in the answer. The two formulations
in the expected and reference solutions are worth comparing, because they
generalise differently - `max(...) > x` is an existence test, while
`count(*) FILTER (WHERE ...) > n` extends naturally to "at least n such
rows".

## ex7 - each group as a share of the whole

The percent-of-total column is where beginners discover that a grouped query
has no way to see outside its group. Three routes exist: a scalar subquery
(this drill), a CTE holding the total (the reference), or the window form
`sum(sum(total)) OVER ()` from lesson 16, which computes the total from the
group results themselves in a single pass. All three are correct; the window
version scans once, which is the reason it exists. Sanity check your answer
by adding the four percentages - they must come to 100.

## ex8 - grouping a grouped result, then joining it

This is the standard three-step report - qualify a population, enrich it with
a dimension, count it - and each step is a construct from a different lesson.
The join has to come after the `HAVING`, because the qualification is about
orders and the dimension lives on customers; trying to do it in one grouped
query would mean grouping by country and customer at once, which counts
orders rather than people. In the outer query `count(*)` counts customers,
because one row of the subquery is one customer, and being deliberate about
what a row means at each level is what keeps these queries honest.

## Further reading

- [`GROUP BY` and `HAVING`](https://www.postgresql.org/docs/16/queries-table-expressions.html) - section 7.2.4 on HAVING, including what may and may not be referenced there.
- [`SELECT`](https://www.postgresql.org/docs/16/sql-select.html) - the evaluation order of the clauses, which explains every alias-visibility rule in this lesson.
- [Subquery Expressions](https://www.postgresql.org/docs/16/functions-subquery.html) - scalar subqueries, used as the denominator in exercise 7.
- [`WITH` queries (CTEs)](https://www.postgresql.org/docs/16/queries-with.html) - naming an aggregated result so a second query can group it again.
