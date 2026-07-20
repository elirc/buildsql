# 43 — BRIN (and a wave at GiST)

`events.ts` has a property no other column here has: it's **physically
correlated** with row order — the seed appends events in time order,
one per second, so page 1 holds the oldest timestamps and the last
page the newest. A B-tree on it works fine... and stores an entry for
every one of 3 million rows to do it. **BRIN** (Block Range INdex)
exploits the correlation instead: per *range of pages*, store just the
min and max `ts`. A time-range query skips every page range whose
min/max can't overlap. The index is a rounding error in size.

## Concept

```sql
CREATE INDEX events_ts_brin_idx ON events USING brin (ts);
```

- BRIN only works when value order ≈ physical order (check
  `pg_stats.correlation` — near 1.0 is BRIN country). Append-only
  logs, event streams, IoT: perfect. A column like `orders.total`
  (values scattered everywhere): useless — every page range spans the
  whole domain and nothing prunes.
- The plan shape is bitmap-flavored (lesson 38): `Bitmap Heap Scan`
  over a `Bitmap Index Scan` on the BRIN, with lossy blocks rechecked.
  More rechecking than a B-tree; unbeatable size-per-usefulness.
- **GiST**, the other specialist family, gets an honest wave rather
  than an exercise: it generalizes trees to *overlapping* regions —
  geometric shapes, ranges (`tstzrange` — "no double-booking"
  exclusion constraints!), nearest-neighbor `ORDER BY point <-> ?`.
  PostGIS runs on it. File it under "know it exists"; reach for it
  when your predicate is *contains / overlaps / nearest*, not equals.

## Exercise 1 — BRIN the clickstream

`ex1/solution.sql` (provided) — half a day of traffic:

```sql
SELECT count(*)
FROM events
WHERE ts >= '2023-11-14 00:00+00'
  AND ts < '2023-11-14 12:00+00';
```

Edit `ex1/indexes.sql`: the BRIN index. The gate wants no Seq Scan and
8x — which a 48 KB index will deliver over 3 million rows, because the
data cooperates.

Run: `uv run dojo test 43_gist_brin ex1`

## Exercise 2 — weigh both trees

`ex2/indexes.sql`: create **both** a B-tree and the BRIN on
`events.ts`, named exactly `events_ts_btree_idx` and
`events_ts_brin_idx`. `ex2/solution.sql` then answers with a query
(copy it in):

```sql
SELECT pg_relation_size('events_ts_btree_idx') >
       50 * pg_relation_size('events_ts_brin_idx');
```

Expected answer: `true` — the B-tree is not 2x or 10x but *hundreds* of
times larger. Check the actual sizes in the lab with
`pg_size_pretty()`; the number is worth having seen once.

Run: `uv run dojo test 43_gist_brin ex2`

## The gate

```python
"""Gates for 43_gist_brin. Quoted verbatim in README.md.

Part 5's three-stage gate: correct rows -> right plan shape -> fast enough
against this machine's own cached baseline (data/baseline.json).
"""
import pytest

from dojo import db, grader, timing
from dojo.lesson import Lesson
from dojo.plan import explain

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex1",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex2(lesson_db):
    """Size comparison: indexes must exist BEFORE the probe can run."""
    ex = L.exercise("ex2")
    ex.apply_indexes(lesson_db)
    expected = ex.fetch(lesson_db, ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
```

## The teaching point

BRIN is the index you retrofit onto the table everyone was afraid of:
the 2-billion-row events archive where a B-tree would take 50 GB you
don't have. It costs almost nothing to try (`CREATE INDEX ... USING
brin` builds fast, too). The prerequisite check is one query away —
`SELECT correlation FROM pg_stats WHERE tablename = '...' AND attname
= '...'` — and "is the data physically ordered by this column?" is a
question worth asking about every big time-series table you ever meet.

Next: **44_mvcc_vacuum_bloat** — where dead rows go, and who cleans up.
