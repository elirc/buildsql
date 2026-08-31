# 113 - Drills: mixed gauntlet, set 2

Second gauntlet. The welds get less obvious: semi-joins hiding inside
conditional aggregates, set operations over JSONB tests, grouping sets fed
by a staged join. Say what each clause is for before you type it.

## Exercise 1 - the name census

The five most common first initials among customer names: `initial` =
the first character of `name`, `customers` = how many names start with it.

**Ordered by `customers` descending, then `initial` ascending, limited to 5
rows.**

Edit `ex1/solution.sql`. Run: `uv run dojo test 113_drills_mixed_2 ex1`

## Exercise 2 - how stale is the pending pile?

As of the dataset's last day (`DATE '2023-11-14'`): one row with
`pending_orders` = how many orders are `pending`, and `avg_age_days` = the
average age in whole days (`DATE '2023-11-14' - created_at::date`),
rounded to 1 decimal.

Edit `ex2/solution.sql`. Run: `uv run dojo test 113_drills_mixed_2 ex2`

## Exercise 3 - who actually bought off product 7's page?

Every `purchase` event whose payload `path` is exactly `'/p/7'`: columns
`id`, `customer_id`, `value` = the payload's `value` **as an integer**.

**Ordered by `id` ascending.**

Edit `ex3/solution.sql`. Run: `uv run dojo test 113_drills_mixed_2 ex3`

## Exercise 4 - the management premium

Per department: `mgr_avg` = the average salary of people who manage at
least one person, `ic_avg` = the average salary of everyone else - both
rounded to 2. "Manages someone" means their `id` appears as another row's
`manager_id`. A department with nobody on one side shows NULL there.
Columns `department`, `mgr_avg`, `ic_avg`.

**Ordered by `department` ascending.**

Edit `ex4/solution.sql`. Run: `uv run dojo test 113_drills_mixed_2 ex4`

## Exercise 5 - the freshest opinion per category

For each product category, its most recent review: columns `category`,
`review_id`, `rating`, `created_at`. Ties on `created_at` broken by the
review's `id`, higher wins. The category lives one join away from the
review.

**Ordered by `category` ascending.** (6 rows.)

Edit `ex5/solution.sql`. Run: `uv run dojo test 113_drills_mixed_2 ex5`

## Exercise 6 - eco or sale, not both

Products tagged `'eco'` or tagged `'sale'` but **not both**: columns `id`,
`name`. Tag tests are containment against `attributes -> 'tags'`.

**Ordered by `id` ascending.**

Edit `ex6/solution.sql`. Run: `uv run dojo test 113_drills_mixed_2 ex6`

## Exercise 7 - are the baskets growing?

For every customer with `id <= 10` who has at least two orders: compare
their **first** order's `total` with their **last** order's (first and
last by `created_at`, ties by order `id` - lowest wins for first, highest
for last). Columns `customer_id`, `orders`, `first_total`, `last_total`,
`direction` = `'up'` / `'down'` / `'flat'` comparing last against first.

**Ordered by `customer_id` ascending.**

Edit `ex7/solution.sql`. Run: `uv run dojo test 113_drills_mixed_2 ex7`

## Exercise 8 - the exec one-pager

Over **paid and shipped** orders only, line revenue (`quantity * price`)
three ways in one result: by product `category`, by order `status`, and
one grand-total row - no cross-tab. Add `pct_of_total` =
`round(100.0 * revenue / grand total, 1)` on every row (the grand-total
row reads 100.0). Columns `category`, `status`, `revenue`,
`pct_of_total`; the dimension a row is not grouped by is NULL.

**Ordered by `category` ascending, then `status` ascending** (NULLs last,
so the grand total lands at the bottom). (9 rows: 6 categories + 2
statuses + 1 total.)

Edit `ex8/solution.sql`. Run: `uv run dojo test 113_drills_mixed_2 ex8`

## The gate

```python
"""Gates for 113_drills_mixed_2. Quoted verbatim in README.md."""
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
    grader.assert_rows_equal(actual, expected)


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
compares rows. Exercise 2 returns a single row and is graded unordered; the
rest name an ordering and use `ordered=True`.

Next: **114_drills_mixed_3** - the final gauntlet.
