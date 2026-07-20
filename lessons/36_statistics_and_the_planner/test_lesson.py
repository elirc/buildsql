"""Gates for 36_statistics_and_the_planner. Quoted verbatim in README.md."""
import pytest

from dojo import grader
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
