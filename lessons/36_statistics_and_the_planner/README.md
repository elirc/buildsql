# 36 — Statistics and the planner

Lessons 31–35 made it look like indexes are always used when they fit.
They aren't — and when the planner "ignores your index", it's usually
being smarter than you, or working from stale information. The planner
chooses plans by **estimating row counts**, and those estimates come
from **statistics**: per-column histograms and most-common-value lists
that `ANALYZE` samples into `pg_stats`. Wrong stats → wrong estimates →
wrong plan. This lesson you get to cause, observe, and fix that.

`setup.sql` builds `hot_orders`: a full copy of `orders` with
autovacuum disabled and **no statistics whatsoever** — plus 500 rows of
a status the original table never had: `'refunded'`.

## Concept

```sql
ANALYZE hot_orders;                  -- resample statistics, table-level

SELECT * FROM pg_stats
WHERE tablename = 'hot_orders' AND attname = 'status';
-- most_common_vals: {paid, cancelled, shipped, pending, refunded}
-- most_common_freqs: {0.50, 0.166, ...}
```

- **Estimates drive everything.** `EXPLAIN` prints `rows=` per node
  *before* running; `EXPLAIN ANALYZE` prints both. A big gap between
  them is the diagnostic — the plan was chosen for a query shape that
  doesn't exist.
- Autovacuum normally re-ANALYZEs tables as they churn; bulk loads and
  freshly-created tables are the classic windows where stats lag (your
  ETL job creates a table, immediately queries it, and gets a comedy
  plan).
- **Selectivity decides index use.** `status = 'refunded'` matches 500
  of ~500k rows — index, obviously. A predicate matching nearly the
  whole table — an index would add tree-walking on top of reading
  everything anyway; a sequential read wins. The planner knowing the
  difference IS the statistics working. "Postgres isn't using my
  index" is very often "my predicate matches too much for an index to
  help".

## Exercise 1 — heal the stats

Edit `ex1/solution.sql`. In the lab, first watch the sickness:
`EXPLAIN SELECT * FROM hot_orders WHERE status = 'refunded';` — with no
stats, the estimate is wildly off the actual 500. Your solution: the
one statement that fixes it. The gate checks `pg_stats` has rows for
`hot_orders` and that the estimate lands within an order of magnitude.

Run: `uv run dojo test 36_statistics_and_the_planner ex1`

## Exercise 2 — selectivity in action

`ex2/solution.sql` (provided):

```sql
SELECT id, total
FROM hot_orders
WHERE status = 'refunded';
```

Edit `ex2/indexes.sql`: index `status`. The gate then explains **two**
queries against your index: the rare `'refunded'` (must use the index)
and the everything-but-refunds sweep — `status IN ('paid', 'pending',
'shipped', 'cancelled')`, 99.9% of the table — which must **still Seq
Scan**. Same index, same column, opposite correct answers. (Try the
in-between in the lab: plain `status = 'paid'` at ~50% often gets a
*bitmap* scan — the planner's middle gear from upcoming lesson 38 —
because visiting every page anyway while skipping the filter on
non-matching rows can price out cheaper than a raw seq scan. The
spectrum is real, and the planner walks it for you.)

Run: `uv run dojo test 36_statistics_and_the_planner ex2`

## Exercise 3 — buy the planner a better sample

Edit `ex3/solution.sql`. `hot_orders.status` has a rare value the default
sample can under-represent. Two statements:

1. raise the per-column statistics target for `hot_orders.status` to
   **1000** (`ALTER TABLE ... ALTER COLUMN ... SET STATISTICS 1000`);
2. `ANALYZE hot_orders` so the new target takes effect.

The target is the number of entries PostgreSQL keeps in that column's
most-common-values list and histogram — 100 by default, up to 10,000.
Raising it costs a slower `ANALYZE` and a slightly slower planning phase,
and it buys sharper estimates on skewed columns. It is the first knob to
reach for when a plan is bad *because* the estimate is wrong, and it is
far more targeted than the global `default_statistics_target`.

The gate checks the catalog records the new target and that fresh
statistics exist.

Run: `uv run dojo test 36_statistics_and_the_planner ex3`

## Exercise 4 — a good estimate earns an index

`ex4/solution.sql` (provided) hunts the maximum-value rows in the
statistics workbench:

```sql
SELECT id, customer_id, status
FROM hot_orders
WHERE total > 1999.90;
```

Edit `ex4/indexes.sql`.

The gate analyses `hot_orders` before and after building your index, then
requires no `Seq Scan` and the usual 8×. The point is the dependency you
have now seen from both sides: the index is only *chosen* because the
statistics tell the planner that `total > 1999.90` matches a handful of
rows. With no statistics the planner guesses, and a guess that says "this
matches a third of the table" makes it decline the index you just
built.

Run: `uv run dojo test 36_statistics_and_the_planner ex4`

## The gate

```python
"""Gates for 36_statistics_and_the_planner. Quoted verbatim in README.md."""
import pytest

from dojo import grader, timing
from dojo.lesson import Lesson
from dojo.plan import explain

L = Lesson(__file__)


def test_ex1(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)  # should ANALYZE hot_orders
    lesson_db.commit()
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) > 0 FROM pg_stats "
        "WHERE tablename = 'hot_orders' AND attname = 'status'",
        True, "hot_orders has column statistics - did you ANALYZE it?")
    p = explain(lesson_db, "SELECT * FROM hot_orders WHERE status = 'refunded'",
                analyze=True)
    est = p.root.get("Plan Rows", 0)
    act = p.root.get("Actual Rows", 0)
    assert act > 0 and est <= act * 20, (
        f"PLANNER MISESTIMATE: with fresh statistics the planner should "
        f"estimate roughly {act} 'refunded' rows; it estimated {est:,}. "
        "That smells like stale (or missing) statistics - reread the lesson."
    )


def test_ex2(lesson_db):
    L.apply_setup(lesson_db)
    lesson_db.execute("ANALYZE hot_orders")
    ex = L.exercise("ex2")
    ex.apply_indexes(lesson_db)
    lesson_db.execute("ANALYZE hot_orders")

    # rare value: the index is worth it
    expected = ex.fetch(lesson_db, ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p_rare = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p_rare, must_not_have=["Seq Scan"])

    # near-total sweep: the planner should refuse the same index outright
    p_common = explain(lesson_db,
                       "SELECT id, total FROM hot_orders WHERE status IN "
                       "('paid', 'pending', 'shipped', 'cancelled')")
    grader.assert_plan(p_common, must_have=["Seq Scan"])


def test_ex3(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    grader.assert_scalar(
        lesson_db,
        "SELECT a.attstattarget FROM pg_attribute a "
        "JOIN pg_class c ON c.oid = a.attrelid "
        "WHERE c.relname = 'hot_orders' AND a.attname = 'status'",
        1000, "the per-column statistics target is recorded in the catalog")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) > 0 FROM pg_stats "
        "WHERE tablename = 'hot_orders' AND attname = 'status'",
        True, "statistics exist - the ALTER does nothing until you ANALYZE")


def test_ex4(lesson_db):
    ex = L.exercise("ex4")
    L.apply_setup(lesson_db)
    lesson_db.execute("ANALYZE hot_orders")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex4",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)
```

## The teaching point

The debugging sequence for "query suddenly slow in production" is:
EXPLAIN ANALYZE → compare estimated vs actual rows per node → if
they diverge, ask when the table was last analyzed
(`pg_stat_user_tables.last_analyze`) and what changed (bulk load?
skewed new tenant?). `ANALYZE` is free and instant compared to every
other intervention — it's the "have you turned stats off and on again"
of database work, and it genuinely fixes a remarkable share of pages.

Next: **37_join_algorithms** — how the planner joins, and why indexes
change its mind.
