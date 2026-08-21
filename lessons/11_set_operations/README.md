# 11 — Set operations

Joins combine tables *sideways* — matching rows, widening them. Set
operations combine result sets *vertically*: two queries, same column
shape, stacked. "Customers who are big spenders **or** live in Brazil."
"US customers **who have never ordered**." When the question contains
or / and-also / but-not between two *lists*, think set ops.

## Concept

```sql
SELECT customer_id FROM orders WHERE total > 1990
UNION
SELECT id FROM customers WHERE country = 'BR';
```

- `UNION` merges and **deduplicates**. `UNION ALL` merges and keeps
  duplicates — it's also faster, because dedup costs a sort or hash of
  the whole result. If duplicates are impossible or harmless, reach for
  `UNION ALL` by default.
- `INTERSECT` keeps rows present in **both** results. `EXCEPT` keeps rows
  of the first result **not present** in the second. Both dedup like UNION.
- **Column compatibility**: both sides must produce the same number of
  columns with compatible types. The *names* come from the first query;
  Postgres doesn't care if the second query calls it something else.
- Set ops treat two NULLs as equal for dedup purposes — one of the few
  places SQL does that (compare lesson 05's `IS DISTINCT FROM`).

## Exercise 1 — either list

Edit `ex1/solution.sql`. One deduplicated column `customer_id`: every
customer who placed an order with `total > 1990`, **plus** every customer
from `'BR'`. Any order.

Run: `uv run dojo test 11_set_operations ex1`

## Exercise 2 — in one list, not the other

Edit `ex2/solution.sql`. Every `'US'` customer id that has **never**
appeared as an `orders.customer_id`. One column, any order. Yes, this is
lesson 09's anti-join wearing set-op clothes — with EXCEPT it's two lines.
(Bonus thought, not graded: why is EXCEPT immune to lesson 05's NOT IN
NULL trap? Because EXCEPT compares NULLs as equal instead of unknown.)

Run: `uv run dojo test 11_set_operations ex2`

## Exercise 3 — in both lists

Edit `ex3/solution.sql`. Marketing wants the overlap between two segments:
customers who are **in the US** *and* have placed **at least one order
over 1900**.

One deduplicated column, `id`, any order.

`INTERSECT` keeps the rows that appear in both results. Note that you could
also write this as a join — and for two lists of ids, `INTERSECT` says
exactly what you mean with no join key to get wrong, no risk of the
many-to-many fan-out that would duplicate a customer with three big orders,
and automatic deduplication. Try the join version in the lab and count the
rows before you dedupe; the difference is the argument for the set
operator.

Run: `uv run dojo test 11_set_operations ex3`

## Exercise 4 — UNION ALL, and the duplicates it keeps

Edit `ex4/solution.sql`. Build a raw contact list for two campaigns,
**keeping every duplicate**: every `customer_id` from orders with `total >
1995`, stacked with `UNION ALL` onto every `id` from customers in
`'AU'`.

One column, any order, duplicates preserved.

Then run the same query with plain `UNION` in the lab and compare the row
counts. Two effects are mixed into that difference: a customer with three
enormous orders appears three times in the first half alone, and an
Australian customer with a big order appears in both halves. `UNION` erases
both — sometimes that is the fix and sometimes it is the bug, and only you
know which.

Run: `uv run dojo test 11_set_operations ex4`

## Challenge — symmetric difference (optional)

Edit `challenge/solution.sql`. Marketing has two segments: **A** =
customers with at least one order over 1980; **B** = customers in `'AU'`.
They want everyone in **exactly one** of the two segments — A-not-B plus
B-not-A. One column `id`, any order. There's no SYMMETRIC EXCEPT
operator; compose it from two EXCEPTs and a UNION (parentheses around
each half keep the precedence honest).

Run: `uv run dojo test 11_set_operations challenge`

## Spaced review

`review1/`: the holiday gift guide — one result with two columns `label`,
`name`: the literal text `'gift'` with every toys-category product under
20, stacked (UNION ALL) with the literal `'snack'` and every food product
under 10. Any order. (Literals in a SELECT list produce the same value
for every row — that's how you tag which half a row came from.)

## The gate

```python
"""Gates for 11_set_operations. Quoted verbatim in README.md."""
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

UNION vs UNION ALL is a real performance lever: deduplicating a
10-million-row union costs a sort/hash you may not need, and reviewers
who spot a UNION between provably-disjoint sets will ask for ALL. The
reverse bug is subtler — UNION silently *hiding* duplicates a report was
supposed to show. In every code review: which dedup behavior does this
query need, and which did it get?

Next: **12_fundamentals_capstone** — Part 1's graduation exam.
