# 71 - Drills: GROUP BY and HAVING, set 2

Set 1 grouped by columns. These eight group by *expressions* - a truncated
timestamp, a first letter, a boolean, a CASE bucket, an extracted weekday -
which is how every per-period and per-tier report in existence is actually
built. Lesson 07 is the source; 04's `CASE` and 18's date functions supply
the expressions.

## Exercise 1 - reviews per month

Group `reviews` by `date_trunc('month', created_at)` and return `month`
(that expression), `reviews` = how many arrived that month, and `avg_rating`
= the average rating that month rounded to 2.

**Ordered by `month` ascending.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 71_drills_group_having_2 ex1`

## Exercise 2 - two grouping keys

Group `orders` by status and quarter. Return `status`, `quarter` =
`date_trunc('quarter', created_at)`, `orders` = the row count, and `revenue`
= `sum(total)` rounded to 2.

**Ordered by `status` ascending, then `quarter` ascending.**

Edit `ex2/solution.sql`. Run: `uv run dojo test 71_drills_group_having_2 ex2`

## Exercise 3 - grouping by a piece of a string

How are customer names distributed by first letter? Group by
`upper(left(name, 1))` and return `initial` (that expression) and
`customers` = how many names start with it.

**Ordered by `initial` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 71_drills_group_having_2 ex3`

## Exercise 4 - grouping by a boolean

Split `orders` in two by size. Group by the expression `total > 1000` and
return `big_order` (that boolean), `orders` = how many are in the group, and
`avg_total` = the average total in the group rounded to 2.

**Ordered by `big_order` ascending** - false comes first.

Edit `ex4/solution.sql`. Run: `uv run dojo test 71_drills_group_having_2 ex4`

## Exercise 5 - CASE buckets and a share of the whole

Bucket the reviews into sentiment tiers: ratings 1 and 2 are `'negative'`,
rating 3 is `'neutral'`, ratings 4 and 5 are `'positive'`. Return
`sentiment` (that expression), `reviews` = how many are in the tier, and
`pct` = the tier as a percentage of all reviews, rounded to 2.

Compute the denominator with a scalar subquery over the whole table, and
write the percentage as `100.0 * count(*) / (that subquery)`.

**Ordered by `sentiment` ascending** - alphabetically, so negative, neutral,
positive.

Edit `ex5/solution.sql`. Run: `uv run dojo test 71_drills_group_having_2 ex5`

## Exercise 6 - grouping by a calendar component

Does order volume vary by day of week? Group `orders` by
`extract(isodow FROM created_at)` - Monday is 1, Sunday is 7 - and return
`weekday` (that expression), `orders` = the row count, and `avg_total` = the
average total rounded to 2.

**Ordered by `weekday` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 71_drills_group_having_2 ex6`

## Exercise 7 - a computed rate, filtered by HAVING

For each month, what share of orders was cancelled? Group `orders` by
`date_trunc('month', created_at)` and return `month`, `orders` = the row
count, `cancelled` = how many were cancelled, and `cancel_pct` =
`100.0 * cancelled / orders` rounded to 2 - keeping only the months where
that percentage is above 16.7.

The condition in `HAVING` has to repeat the expression; output aliases are
not visible there.

**Ordered by `month` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 71_drills_group_having_2 ex7`

## Exercise 8 - grouping the output of a grouping

How many customers are light, medium and heavy buyers? First count each
customer's orders, then bucket those counts: 5 or fewer is `'1-5'`, 6 to 10
is `'6-10'`, and anything more is `'11+'`. Return `bucket` and `customers` =
how many customers fall in it.

Only customers who have placed at least one order can appear.

**Ordered by `bucket` ascending** - plain text ordering, so `'1-5'`, `'11+'`,
`'6-10'`.

Edit `ex8/solution.sql`. Run: `uv run dojo test 71_drills_group_having_2 ex8`

## The gate

```python
"""Gates for 71_drills_group_having_2. Quoted verbatim in README.md."""
from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(shared_lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex2(shared_lesson_db):
    ex = L.exercise("ex2")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex3(shared_lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex4(shared_lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex5(shared_lesson_db):
    ex = L.exercise("ex5")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex6(shared_lesson_db):
    ex = L.exercise("ex6")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex7(shared_lesson_db):
    ex = L.exercise("ex7")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex8(shared_lesson_db):
    ex = L.exercise("ex8")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
```

Every gate runs the reference query and yours against the same clone and
compares rows in order, because each prompt names one. When a grouping key is
an expression, the value in your output has to match the expected value
exactly - which is why the prompts spell the expression out rather than
describing it.

Next: **72_drills_group_having_3**, the last grouping set: HAVING against
WHERE at full strength, and groups computed from other groups.
