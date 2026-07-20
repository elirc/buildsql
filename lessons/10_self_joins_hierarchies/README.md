# 10 — Self-joins and hierarchies

`staff.manager_id` points back into `staff` itself: employee 87's manager
is just another row of the same table. Org charts, category trees,
thread replies, "people also bought" — self-referencing tables are
everywhere, and querying them means joining a table **to itself**. There
is no new syntax; there is a new mental move: *the same table, worn as two
different hats, distinguished purely by alias*.

## Concept

```sql
SELECT e.name AS employee, m.name AS manager
FROM staff e
JOIN staff m ON m.id = e.manager_id;
```

`e` and `m` are both `staff`. The alias is doing all the work — `e` plays
"employee", `m` plays "manager". Two things to notice:

- With an INNER join, the CEO (NULL `manager_id`, lesson 05) drops out:
  NULL matches nothing. 500 staff, 499 pairs. If the report must include
  her, that's a LEFT JOIN (lesson 09 — see how these stack?).
- Nothing stops you comparing the two hats: `e.salary > m.salary` is a
  perfectly good join-or-filter condition. Self-joins are how you ask
  *relative* questions inside one table.

**The pairs trick.** "All pairs of same-department colleagues" naively
gives you each pair twice (A,B and B,A) plus self-pairs (A,A). The idiom:

```sql
ON a.department = b.department AND a.id < b.id
```

`<` kills self-pairs *and* keeps exactly one of each mirror-pair. Remember
this; it shows up in dedup interviews constantly.

## Exercise 1 — who reports to whom

Edit `ex1/solution.sql`. Every employee with a manager: two columns,
`employee` (their name) and `manager` (the manager's name). 499 rows, any
order.

Run: `uv run dojo test 10_self_joins_hierarchies ex1`

## Exercise 2 — finance pairs

Edit `ex2/solution.sql`. Every unordered pair of distinct staff who are
both in `finance` — for a secret-santa draw. Columns: the two names, with
the **lower id first**. Each pair exactly once. Any row order. (61
finance staff → 1,830 pairs.)

Run: `uv run dojo test 10_self_joins_hierarchies ex2`

## Challenge — paid more than the boss (optional)

Edit `challenge/solution.sql`. The awkward report: employees who earn
**strictly more than their own manager**. Columns: `id`, `name`,
`salary`, and the manager's salary aliased `manager_salary`. Any order.
(19 rows — the seed builds salary bands that overlap between levels, on
purpose.)

Run: `uv run dojo test 10_self_joins_hierarchies challenge`

## Spaced review

`review1/`: the **teammates of employee 42** — everyone who shares 42's
manager, excluding 42. Columns: `id`, `name`. Any order. Pure self-join;
no subquery needed (wear one hat for employee 42, the other for the
teammates).

## The gate

```python
"""Gates for 10_self_joins_hierarchies. Quoted verbatim in README.md."""
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

Self-joins answer "one level" questions: my manager, my teammates, my
direct reports. The moment the question becomes "my manager's manager's
manager" or "everyone under me, however deep", chained self-joins explode —
that's what recursive CTEs are for, and they arrive in lesson 14. Knowing
*which* of the two you're looking at is a genuine senior-engineer tell.

Next: **11_set_operations** — UNION, INTERSECT, EXCEPT.
