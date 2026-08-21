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
