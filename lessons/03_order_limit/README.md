# 03 — ORDER BY, LIMIT, OFFSET

"Give me the ten most expensive products" is two operations, not one: sort
10,000 rows by price, then keep the first ten. Until now your result rows
came back in whatever order PostgreSQL found convenient — and that order is
**not guaranteed and not stable**. The moment anyone says "top", "latest",
"first", or "page 2", you need `ORDER BY`.

## Concept

```sql
SELECT id, name, price
FROM products
ORDER BY price DESC, id ASC
LIMIT 10;
```

- `ORDER BY` takes a comma-separated list of sort keys. Each key sorts
  ascending (`ASC`, the default) or descending (`DESC`). Later keys break
  ties in earlier keys.
- **Always give the gate a deterministic order.** If two products share a
  price, "order by price" alone leaves their relative order to chance. Every
  ordered exercise in this course names a tie-breaker (usually `id`) —
  include it.
- `NULLS FIRST` / `NULLS LAST` control where NULLs sort. By default NULLs
  come last when ascending, first when descending. (`staff.manager_id` is
  the NULL column you'll meet properly in lesson 05.)
- `LIMIT n` keeps the first n rows *of the sorted result*. `OFFSET m` skips
  m rows first — that's how naive pagination works, and why deep pages get
  slow: OFFSET 100000 still sorts and walks the first 100,000 rows to throw
  them away.

This lesson's gates check row order (`ordered=True`) — the first time the
gate cares not just *which* rows, but *in what sequence*.

## Exercise 1 — top N

Edit `ex1/solution.sql`. **The 10 most expensive products.** Columns, in
order: `id`, `name`, `price`. Sort by `price` descending; break price ties
by `id` ascending. Exactly 10 rows.

Run: `uv run dojo test 03_order_limit ex1`

## Exercise 2 — multi-key sort

Edit `ex2/solution.sql`. HR wants a salary review sheet: the **top 20 staff
rows** sorted by `department` ascending, then `salary` descending within
each department, then `id` ascending as the final tie-break. Columns:
`name`, `department`, `salary`.

Run: `uv run dojo test 03_order_limit ex2`

## Exercise 3 — pagination with OFFSET

Edit `ex3/solution.sql`. The admin UI shows customers **newest first**, 10
per page. Produce **page 3** — that is, skip the first 20, return the next
10. Sort by `created_at` descending, tie-break `id` descending. Columns:
`id`, `name`, `created_at`.

Run: `uv run dojo test 03_order_limit ex3`

## Exercise 4 — where do NULLs sort?

Edit `ex4/solution.sql`. The org-chart tool renders the reporting tree from
the top down, so it wants the row with **no manager first**. Return the
**first 10** staff rows sorted by `manager_id` **ascending with NULLs
first**, breaking ties by `id` ascending.

Columns: `id`, `name`, `manager_id`. Exactly 10 rows, and the order is
graded.

By default an ascending sort puts NULLs *last* in PostgreSQL. You have to
say `NULLS FIRST` to get the CEO to the top — and other databases pick the
opposite default, which is why portable SQL says it explicitly.

Run: `uv run dojo test 03_order_limit ex4`

## Exercise 5 — top N over half a million rows

Edit `ex5/solution.sql`. Finance wants the **15 largest orders ever
placed**. Columns, in order: `id`, `customer_id`, `total`. Sort by `total`
descending, break ties by `id` ascending. Exactly 15 rows, order graded.

Exercise 1 sorted 10,000 products; this sorts 500,000 orders to return 15
rows. Run `dojo plan 03_order_limit ex5` afterwards and look for the word
`Sort` — you are watching PostgreSQL sort half a million rows to answer a
question about fifteen of them. Lesson 35 removes that sort entirely with an
index, and this is the query you will compare against.

Run: `uv run dojo test 03_order_limit ex5`

## Exercise 6 — a deep page

Edit `ex6/solution.sql`. The product catalogue lists items **cheapest
first**, 10 per page. Produce **page 51** — skip the first 500 rows and
return the next 10.

Sort by `price` ascending, tie-break `id` ascending. Columns: `id`, `name`,
`price`. Exactly 10 rows, order graded.

Exercise 3 asked for page 3. This one asks for page 51, and the query is
identical except for one number — which is precisely the problem with
`OFFSET`. To hand you rows 501–510, PostgreSQL sorts the catalogue and then
walks past the first 500 results and throws them away. Page 5,000 would
throw away 50,000. The reading explains what real systems do instead.

Run: `uv run dojo test 03_order_limit ex6`

## Challenge — top 5 per category, no window functions (optional, hard)

Edit `challenge/solution.sql`. **The 5 most expensive products in *each* of
the 6 categories** — 30 rows. Columns: `category`, `name`, `price`. Order
the whole result by `category` ascending, then `price` descending, then `id`
ascending.

This is genuinely hard with what you know so far — `LIMIT` applies to the
whole result, not per group. The intended tool is a *correlated subquery*
(lesson 13 material, previewed here): for each product, ask "is this
product's id among the top 5 ids of its own category?". The hints walk you
through the shape. In lesson 15 you'll solve this in three lines with a
window function and feel great about it.

Run: `uv run dojo test 03_order_limit challenge`

## Spaced review

`review1/`: the **5 cheapest products in category `'food'`** — columns
`id`, `name`, `price`, ordered by `price` ascending then `id` ascending.

## The gate

```python
"""Gates for 03_order_limit. Quoted verbatim in README.md."""
import pytest

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
    grader.assert_rows_equal(actual, expected, ordered=True)
```

`ordered=True` means the gate compares row-by-row, in sequence. If you have
the right rows in the wrong order, the failure message will tell you exactly
that — and that your ORDER BY is the thing to fix.

## The teaching point

Unordered results are a classic source of "works on my machine" bugs: a
query without ORDER BY happens to return rows in insertion order in dev,
then a parallel scan in production shuffles them and a UI regression ticket
appears. The rule in real systems is: **if order reaches a user, it's in the
SQL** — never rely on accidental order, and always break ties
deterministically.

Next: **04_expressions_functions** — computing new values per row.
