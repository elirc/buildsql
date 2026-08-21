# 09 — OUTER JOINs and the anti-join

5,003 of our 50,000 customers have **never placed an order**. Ask lesson
08's INNER JOIN to list customers with their orders and those 5,003 simply
don't appear — an inner join drops non-matching rows without comment. But
"who has never bought anything?" is one of the most valuable questions in
the building. Answering it requires a join that *keeps* the lonely rows.

## Concept

```sql
SELECT c.id, c.name, o.id AS order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;
```

- `LEFT JOIN` keeps **every** row of the left table. Where no right-side
  match exists, the right-side columns come back as **NULL** — the
  NULL-extension. (`RIGHT JOIN` is the mirror; `FULL JOIN` keeps
  non-matchers from *both* sides.)
- **The anti-join pattern**, built from that NULL:

```sql
SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;          -- only the customers with no match at all
```

  Test the *right table's key column* for NULL — it's never NULL in a real
  match, so NULL there means "no match existed".

- **ON vs WHERE, the distinction that finally bites.** With INNER joins,
  a filter works the same in either place. With a LEFT join:
  - a right-table condition **in ON** filters *which rows count as
    matches* — left rows keep appearing, possibly NULL-extended;
  - the same condition **in WHERE** runs *after* NULL-extension, and since
    `NULL > 1900` is unknown, it silently deletes every non-matching left
    row — your LEFT JOIN just became an expensive INNER JOIN. If you've
    ever seen a LEFT JOIN "not work", this was it.

## Exercise 1 — who never bought anything?

Edit `ex1/solution.sql`. All 5,003 customers with zero orders. Columns:
`id`, `name`. Any order. Use the LEFT-JOIN anti-join pattern (the gate
only checks rows, but you're here to practice the pattern).

Run: `uv run dojo test 09_outer_joins ex1`

## Exercise 2 — dead stock

Edit `ex2/solution.sql`. The 300 products that have never appeared on any
order line. Columns: `id`, `name`. Any order.

Run: `uv run dojo test 09_outer_joins ex2`

## Exercise 3 — counting things that might not exist

Edit `ex3/solution.sql`. The catalogue team wants a review-coverage report
for **toys**: every product in category `'toys'`, with the number of
reviews it has — and products with **no** reviews must appear with a count
of **0**, not vanish.

Columns, in this order: `id`, `name`, and the review count aliased
**`reviews`**. Any row order.

Two details decide whether this is right. The join must be a `LEFT JOIN`
from `products`, so unreviewed products survive. And the count must be
`count(r.id)`, not `count(*)` — a NULL-extended row is still a row, so
`count(*)` would report **1** for a product with no reviews at all. Lesson
06's `count(*)` versus `count(column)` distinction, finally showing its
teeth.

Run: `uv run dojo test 09_outer_joins ex3`

## Exercise 4 — a filter that belongs in ON

Edit `ex4/solution.sql`. Now the same report, but only **5-star** reviews
count: every product in category `'garden'`, with the number of reviews it
has **whose rating is 5** — and again, products with none must appear with
`0`.

Columns, in this order: `id`, `name`, and the count aliased
**`five_star`**. Any row order.

This is the lesson's whole point in one query. `r.rating = 5` is a
condition on the **right** table of a `LEFT JOIN`, so it must go in the
`ON` clause, where it decides *what counts as a match*. Put it in `WHERE`
and it runs after NULL-extension: `NULL = 5` is unknown, every unmatched
product is deleted, and your LEFT JOIN has silently become an INNER JOIN.
Write it both ways in the lab and compare the row counts before you submit.

Run: `uv run dojo test 09_outer_joins ex4`

## Challenge — ON vs WHERE, felt in your hands (optional)

Edit `challenge/solution.sql`. Sales wants **all 2,924 Mexican (`'MX'`)
customers**, and *for those who have any*, their orders over 1900 —
customers without such an order still listed, with NULLs. Columns:
`c.id`, `c.name`, the order `id`, the order `total`. Any order.

The country filter goes in WHERE (it's about the left table). The
total-filter goes **in the ON clause** — move it to WHERE and watch 90% of
the customers vanish. Try both in the lab; count the rows.

Run: `uv run dojo test 09_outer_joins challenge`

## Spaced review

`review1/`: Japanese (`'JP'`) customers with zero orders — columns `id`,
`name`, any order.

## The gate

```python
"""Gates for 09_outer_joins. Quoted verbatim in README.md."""
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
    grader.assert_rows_equal(actual, expected)


@pytest.mark.review
def test_review1(shared_lesson_db):
    ex = L.exercise("review1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

## The teaching point

Every analytics team has a story about a LEFT JOIN that quietly turned
INNER because someone filtered the right table in WHERE — the "customers
without orders" line disappeared from a report for months before anyone
noticed the denominator was wrong. When you review a LEFT JOIN, read the
WHERE clause looking for right-table columns; it's a bug until proven
otherwise. (`NOT EXISTS`, lesson 13, is the other idiomatic anti-join —
often clearer, and immune to this.)

Next: **10_self_joins_hierarchies** — joining a table to itself.
