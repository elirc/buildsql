# 49 — DISTINCT ON

You have already solved "one row per group" three different ways: a correlated
subquery (lesson 13), and `row_number() ... = 1` filtered in a CTE (lesson 15).
Both work everywhere. But Postgres ships a shortcut that is shorter than either
and, for this exact job, usually faster: `DISTINCT ON`.

`DISTINCT ON (expr)` keeps the **first row of each distinct value of `expr`**,
and "first" is decided by the query's `ORDER BY`. That is the whole idea — and
also the whole footgun. If your `ORDER BY` doesn't start with the `DISTINCT ON`
expression, Postgres rejects it; if it does, whatever you sort by *next*
decides which row survives each group.

## Concept

```sql
-- the newest order for each customer
SELECT DISTINCT ON (customer_id)
       customer_id, id, created_at
FROM orders
ORDER BY customer_id, created_at DESC;
```

`ORDER BY customer_id` groups the scan; within each customer, `created_at
DESC` puts the newest order first; `DISTINCT ON (customer_id)` keeps that first
row and discards the rest of the customer's orders. Change `DESC` to `ASC` and
you get each customer's *first* order instead — the selection rule lives
entirely in the `ORDER BY`.

Details that bite:

- **The `ORDER BY` must lead with the `DISTINCT ON` column(s).** `DISTINCT ON
  (category) ... ORDER BY price` is a syntax error. `... ORDER BY category,
  price` is correct.
- Add a **tie-break** (`, id`) when the sort key can repeat within a group, or
  which row you keep is arbitrary and can change between runs.
- The result comes out sorted by the `DISTINCT ON` columns. If you want it
  presented in some *other* order, wrap it in a subquery and sort outside
  (that's the challenge).
- `DISTINCT ON` is PostgreSQL-specific. The portable equivalent is the
  `row_number() = 1` idiom; reach for that if the query must run on another
  database.

## Exercise 1 — the cheapest product in each category

Edit `ex1/solution.sql`. One row per `category`: the product with the lowest
`price`. Columns `category`, `name`, `price`. **6 rows**, any order. (Break
price ties by `id`.)

Run: `uv run dojo test 49_distinct_on ex1`

## Exercise 2 — each department's newest hire

Edit `ex2/solution.sql`. One row per `department`: the most recently hired
person. Columns `department`, `name`, `hired_on`. **5 rows**, any order.

Run: `uv run dojo test 49_distinct_on ex2`

## Exercise 3 — each customer's first order

Edit `ex3/solution.sql`. For every customer with `id <= 30`, their
**earliest** order.

Columns, in this order: `customer_id`, `id` (the order's), `created_at`.
Any row order. (30 rows.)

Same construct, opposite direction. The rule that makes `DISTINCT ON` work
is unchanged: the `ORDER BY` must **start with** the `DISTINCT ON`
expressions, and whatever comes after them decides which row survives per
group. Here that means `ORDER BY customer_id, created_at ASC, id ASC` —
earliest first, with `id` as a deterministic tie-break.

Get the leading columns wrong and PostgreSQL raises an error rather than
guessing, which is one of the friendlier things about this feature.

Run: `uv run dojo test 49_distinct_on ex3`

## Exercise 4 — the best review of each product

Edit `ex4/solution.sql`. For each product with `id <= 20`, the
**highest-rated** review of that product.

Columns, in this order: `product_id`, `id` (the review's), `rating`. Any
row order. (20 rows.)

Ties matter here in a way they did not before: ratings are integers from 1
to 5 over a thousand-odd reviews per product, so a product will have many
5-star reviews and the "best" one is genuinely ambiguous. Break the tie on
`id` ascending so the answer is deterministic.

That is worth generalising. `DISTINCT ON` always returns exactly one row per
group, so *something* decides which — and if you do not say what, PostgreSQL
picks whichever row the sort happened to place first, which can differ
between runs. A `DISTINCT ON` query without a tie-break is a query with a
bug that has not surfaced yet.

Run: `uv run dojo test 49_distinct_on ex4`

## Challenge — priciest per category, ranked (optional)

Edit `challenge/solution.sql`. The most expensive product in each `category` —
columns `category`, `name`, `price` — but the result must be **ordered by
`price` descending** (most expensive category leader first). **6 rows, this
ordering is graded.**

Difficulty note: `DISTINCT ON (category)` forces the query's own `ORDER BY` to
begin with `category`, which fights the presentation order you need. You will
have to select in one query and sort in another.

Run: `uv run dojo test 49_distinct_on challenge`

## The gate

```python
"""Gates for 49_distinct_on. Quoted verbatim in README.md."""
import pytest

from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(shared_lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex2(shared_lesson_db):
    ex = L.exercise("ex2")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex3(shared_lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex4(shared_lesson_db):
    ex = L.exercise("ex4")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


@pytest.mark.challenge
def test_challenge(shared_lesson_db):
    ex = L.exercise("challenge")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
```

`test_ex1`/`test_ex2` compare as a set; `test_challenge` passes `ordered=True`,
so the rows must come back in the required price-descending order.

## The teaching point

`DISTINCT ON` is the tersest way to express "the latest / earliest / best row
per key", and you will see it constantly in Postgres codebases: newest price
per product, latest status per ticket, most recent login per user. The reason
it stays readable where a window function sprawls is that it collapses "rank,
then keep rank 1" into a single clause. Just remember the rule that makes it
work and the rule that trips everyone: the `ORDER BY` is both the grouping
mechanism and the selection mechanism, and it must lead with the `DISTINCT ON`
expression.

Next: **50_grouping_sets** — subtotals and grand totals in one pass.
