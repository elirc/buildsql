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

`ex1/solution.sql` (provided) — one hour of traffic:

```sql
SELECT count(*)
FROM events
WHERE ts >= '2023-11-14 00:00+00'
  AND ts < '2023-11-14 01:00+00';
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

## Exercise 3 — tune the block range

`ex3/solution.sql` (provided) takes a two-hour slice of the clickstream:

```sql
SELECT count(*)
FROM events
WHERE ts >= '2023-11-13 08:00+00'
  AND ts < '2023-11-13 10:00+00';
```

Edit `ex3/indexes.sql` and build a BRIN index with a **smaller block
range**:

```sql
CREATE INDEX ... ON events USING brin (ts) WITH (pages_per_range = 32);
```

The default is 128 pages per summarised range. Fewer pages per range means
more, finer summaries: a bigger index (still tiny — kilobytes, not
gigabytes) that can exclude more of the table for a narrow query. More
pages per range means a smaller index that is coarser and re-reads more
data.

This is the whole BRIN tuning knob, and the trade-off is unusually easy to
reason about: narrow queries want small ranges, wide queries do not care.

Run: `uv run dojo test 43_gist_brin ex3`

## Exercise 4 — the rows your BRIN cannot see

Edit `ex4/solution.sql`. This one is about operating a BRIN, not building
one.

The gate builds `events_ts_brin_new_idx` for you, then inserts **30,000 new
events behind the index's back**. Your job is the one statement that makes
those rows visible to it.

Here is the trap. A BRIN stores one summary per block range, and PostgreSQL
does **not** summarise a range the moment rows land in it — that would mean
touching the index on every insert, which is precisely the cost BRIN exists
to avoid. New pages stay unsummarised until `VACUUM` runs, or until somebody
calls the function that does it explicitly. Until then the index cannot
exclude them, so every query has to read them all.

That is why a BRIN on a freshly loaded table often looks like it "isn't
working": it is working exactly as designed, on the ranges it knows about.
The fixes are to summarise after a bulk load, or to create the index `WITH
(autosummarize = on)` so vacuum does it as it goes.

Your statement must return the number of ranges it summarised — the
function does that for you.

**A note on the exercise this replaced.** An earlier draft asked you to BRIN
`events.id` to show that BRIN cares about physical correlation rather than
about time. That is true — but `events.id` is the table's **primary key**,
so it already has a B-tree, and no BRIN can beat one. The point stands and
is worth testing yourself: `events.customer_id` is scattered across every
block range, so a BRIN on it can never exclude anything.
`pg_stats.correlation` is the number that tells you in advance, and checking
it before building a BRIN is the whole design process.

Run: `uv run dojo test 43_gist_brin ex4`

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
    grader.assert_faster_than_baseline(measured, baseline, ratio=5)


def test_ex2(lesson_db):
    """Size comparison: indexes must exist BEFORE the probe can run."""
    ex = L.exercise("ex2")
    ex.apply_indexes(lesson_db)
    expected = ex.fetch(lesson_db, ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)


def test_ex3(lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex3",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex4(lesson_db):
    """Rows that arrive after a BRIN is built are invisible to it until
    somebody summarises them. The gate builds the index, inserts behind its
    back, and asks the learner to close the gap."""
    ex = L.exercise("ex4")
    lesson_db.execute(
        "CREATE INDEX events_ts_brin_new_idx ON events USING brin (ts) "
        "WITH (pages_per_range = 4)")
    lesson_db.execute(
        "INSERT INTO events (id, customer_id, event_type, payload, ts) "
        "SELECT 90000000 + i, 1, 'view', '{}'::jsonb, "
        "       '2023-12-01'::timestamptz + i * interval '1 second' "
        "FROM generate_series(1, 30000) AS i")
    lesson_db.commit()

    returned = ex.fetch(lesson_db, ex.solution_sql)
    lesson_db.commit()

    assert returned and len(returned[0]) == 1, (
        "Your statement should return one value: the number of block ranges "
        "it summarised."
    )
    summarised = returned[0][0]
    assert isinstance(summarised, int) and summarised >= 20, (
        f"ONLY {summarised!r} RANGE(S) SUMMARISED: 30,000 rows were inserted "
        "after the index was built, which leaves many block ranges uncovered.\n"
        "  There is a function that summarises them; the index is named "
        "'events_ts_brin_new_idx'."
    )
    left = lesson_db.execute(
        "SELECT brin_summarize_new_values('events_ts_brin_new_idx')"
    ).fetchone()[0]
    assert left == 0, (
        f"{left} range(s) still unsummarised after your statement ran - it "
        "should have covered all of them."
    )
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
