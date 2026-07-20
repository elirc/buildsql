# 46 — Materialized views

Lesson 27 was honest about views: they name cost, they don't remove
it. The category-revenue aggregation grinds a million line items every
single time someone opens the dashboard — identical answer, recomputed
forever. A **materialized view** does the aggregation once, *stores*
the six result rows, and serves them like a table. The price is the
one every cache charges: the stored answer goes **stale**, and
freshness becomes your problem.

## Concept

```sql
CREATE MATERIALIZED VIEW category_rev AS
SELECT p.category, sum(oi.quantity * oi.price) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
GROUP BY p.category;

REFRESH MATERIALIZED VIEW category_rev;                -- recompute (locks reads)

CREATE UNIQUE INDEX category_rev_pk ON category_rev (category);
REFRESH MATERIALIZED VIEW CONCURRENTLY category_rev;   -- readers unblocked
```

- It's a real relation: you can index it, EXPLAIN against it, point
  dashboards at it. `SELECT * FROM category_rev` reads six stored rows
  — the million-row join happened in the past.
- `REFRESH` recomputes from scratch. The plain form takes an exclusive
  lock (readers wait); `CONCURRENTLY` swaps in the new contents
  side-by-side — it requires a **unique index** on the matview and
  roughly doubles the work, the classic availability-for-throughput
  trade.
- What PostgreSQL does *not* give you: automatic/incremental refresh.
  Freshness is a policy you own — cron the REFRESH, trigger it after
  loads, or accept "as of last night" and *say so on the dashboard*.

## Exercise 1 — materialize the leaderboard

Edit `ex1/solution.sql`. Create materialized view `category_rev`
(columns `category`, `revenue`) as the concept block defines it. The
gate compares it against the live aggregation, then requires querying
it to be ≥8x faster than computing from scratch.

Run: `uv run dojo test 46_materialized_views ex1`

## Exercise 2 — pay the freshness bill

Edit `ex2/solution.sql`. The gate builds your matview, then **inserts
new line items behind its back**, then runs your solution — which must
bring the view back in line with reality. One statement.

Run: `uv run dojo test 46_materialized_views ex2`

## The gate

```python
"""Gates for 46_materialized_views. Quoted verbatim in README.md."""
from dojo import grader, timing
from dojo.lesson import Lesson

L = Lesson(__file__)

PROBE = "SELECT category, revenue FROM category_rev"


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex1",
                                      ex.expected_sql)
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    actual = ex.fetch(lesson_db, PROBE)
    grader.assert_rows_equal(actual, expected)
    measured = timing.measure_execution_ms(lesson_db, PROBE)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex2(lesson_db):
    lesson_db.execute(L.exercise("ex1").solution_sql)
    lesson_db.commit()
    ex = L.exercise("ex2")

    # the world changes AFTER the materialized view was built
    lesson_db.execute(
        "INSERT INTO order_items (id, order_id, product_id, quantity, price) "
        "SELECT 5000000 + gs, 123, 1, 3, 100.00 FROM generate_series(1, 50) gs")
    lesson_db.commit()

    fresh = lesson_db.execute(L.exercise("ex1").expected_sql).fetchall()
    lesson_db.execute(ex.solution_sql)   # must REFRESH
    lesson_db.commit()
    actual = ex.fetch(lesson_db, PROBE)
    grader.assert_rows_equal(actual, fresh)
```

## The teaching point

The materialized view is the database-native answer to "we cached the
report in Redis and now it disagrees with the invoice page". Same
staleness trade, but the definition lives in SQL next to the data,
refresh is one transactional statement, and any tool that speaks SQL
can read it. The design questions to settle *before* shipping one: how
stale is acceptable (that's your refresh cadence), who triggers
refresh, and does anything join against it mid-refresh (that's the
CONCURRENTLY decision). Cache invalidation stays hard; at least here
it's declared.

Next: **47_capstone** — everything, at once.
