"""Gates for 47_capstone. Quoted verbatim in README.md."""
import pytest

from dojo import catalog, db, grader, timing
from dojo.lesson import Lesson
from dojo.plan import explain

L = Lesson(__file__)


def _no_seq_scan_on(p, tables):
    offenders = [n.get("Relation Name") for n in p.nodes()
                 if n["Node Type"] == "Seq Scan"
                 and n.get("Relation Name") in tables]
    assert not offenders, (
        f"PLAN SHAPE: still sequential-scanning {offenders} - the fat node "
        "is the one to index.\n\nPlan:\n" + p.render()
    )


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex1",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    with db.connect(lesson_db.info.dbname, autocommit=True) as vconn:
        vconn.execute("VACUUM orders")
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    _no_seq_scan_on(p, {"orders"})  # customers may hash-join however it likes
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=5)


def test_ex2(lesson_db):
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "orders", {"channel": "text"})
    catalog.assert_not_null(lesson_db, "orders", "channel")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM orders WHERE channel = 'web'",
        500000, "every existing order backfilled to 'web'")
    grader.assert_scalar(
        lesson_db,
        "SELECT convalidated FROM pg_constraint WHERE conname = 'orders_channel_ck'",
        True, "orders_channel_ck exists and was VALIDATEd")
    catalog.rejects(
        lesson_db,
        "INSERT INTO orders (id, customer_id, status, total, created_at, channel) "
        "VALUES (900001, 1, 'pending', 10, '2023-11-15', 'carrier-pigeon')",
        why="channel must be one of web / mobile / phone")


def test_ex3(lesson_db):
    ex = L.exercise("ex3")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex3",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)
    p = explain(lesson_db, ex.solution_sql)
    _no_seq_scan_on(p, {"orders", "order_items"})
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)
