# 07 — GROUP BY and HAVING

Lesson 06 collapsed 500,000 orders into one row. Business questions are
usually one step subtler: one number **per something** — revenue per
status, orders per customer, products per category. `GROUP BY` partitions
rows into groups and runs your aggregates once per group.

## Concept

```sql
SELECT status, count(*), sum(total)
FROM orders
GROUP BY status;
```

Four groups in, four rows out (per `dataset_facts.md`: paid is by far the
biggest at ~250k orders — the seed weights it 3-in-6).

**The grouping rule** — internalize this and half your future error
messages disappear: *every column in the SELECT list must either appear in
GROUP BY or sit inside an aggregate.* Postgres enforces it because a group
of many rows has no single value for an ungrouped column. If you see
`column "x" must appear in the GROUP BY clause...`, that's this rule.

Filtering happens at two distinct moments:

- `WHERE` filters **rows, before grouping** — cheap, do it here when you can.
- `HAVING` filters **groups, after aggregation** — the only place that can
  see `count(*)`.

```sql
SELECT customer_id, count(*)
FROM orders
GROUP BY customer_id
HAVING count(*) > 20;
```

You can also group by an expression (`GROUP BY date_trunc('month',
created_at)`) — the challenge does exactly that.

## Exercise 1 — revenue per status

Edit `ex1/solution.sql`. For each order `status`: the status, the number
of orders, and the sum of their totals. Three columns, four rows, any
order.

Run: `uv run dojo test 07_group_by_having ex1`

## Exercise 2 — the heavy buyers

Edit `ex2/solution.sql`. Which customers placed **more than 20 orders**?
Return `customer_id` and their order count. Any order. (Around 250
customers qualify — the average is ~11 orders, so >20 is a real outlier.)

Run: `uv run dojo test 07_group_by_having ex2`

## Exercise 3 — filter the rows, then group them

Edit `ex3/solution.sql`. Merchandising wants a summary of the **premium end
of the catalogue only**: considering just the products priced **above
100**, return per `category` the category name, how many such products
there are, and their average price rounded to 2 decimals.

Three columns in that order, six rows, any order.

The price filter is about individual products, so it belongs in `WHERE` —
before grouping, where it throws rows away cheaply. Put it in `HAVING`
instead and PostgreSQL will refuse (`price` is not grouped), which is the
error message doing you a favour.

Run: `uv run dojo test 07_group_by_having ex3`

## Exercise 4 — grouping by an expression

Edit `ex4/solution.sql`. Combine lesson 04's `CASE` with this lesson's
`GROUP BY`. For every combination of **category** and **price tier**,
return the category, the tier, and how many products fall in it.

The tiers are the same three as lesson 04: `'budget'` under 50, `'mid'`
from 50 up to but not including 200, `'premium'` at 200 and above.

Three columns in this order: `category`, the tier aliased **`tier`**,
`count(*)`. Any row order. (Six categories times three tiers — expect 18
rows.)

You can group by the expression itself, or — a PostgreSQL convenience — by
the output alias `tier`. Both work; the first is portable, the second is
readable.

Run: `uv run dojo test 07_group_by_having ex4`

## Challenge — monthly revenue (optional)

Edit `challenge/solution.sql`. Revenue by **calendar month**: one row per
month, columns `month` and `revenue` (sum of `total`), ordered by month
ascending. `date_trunc('month', created_at)` truncates a timestamp to the
first instant of its month — group by it and select it (lesson 18 covers
date functions properly; this is your preview). Orders span 2022-11-14 to
2023-11-14, so expect 13 rows.

Run: `uv run dojo test 07_group_by_having challenge`

## Spaced review

`review1/`: how many products are in each category? Columns `category`,
`count`, any order. (Six categories.)

## The gate

```python
"""Gates for 07_group_by_having. Quoted verbatim in README.md."""
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


@pytest.mark.review
def test_review1(shared_lesson_db):
    ex = L.exercise("review1")
    expected = ex.fetch(shared_lesson_db, ex.expected_sql)
    actual = ex.fetch(shared_lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

## The teaching point

WHERE-vs-HAVING is a performance decision, not just syntax: `WHERE
status = 'paid' GROUP BY customer_id` aggregates half the table;
`GROUP BY customer_id HAVING ... ` with the status check misplaced inside
HAVING aggregates all of it first and throws most of the work away. Filter
rows as early as the semantics allow. When you reach Part 5 and read query
plans, you'll *see* this difference as row counts flowing between plan
nodes.

Next: **08_inner_joins** — finally, more than one table at a time.
