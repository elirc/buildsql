"""Gates for 52_keyset_pagination. Quoted verbatim in README.md.

Part 8's inversion, sharpened: setup.sql's feed index is applied *before* the
baseline is measured, so the naive OFFSET query is timed with exactly the
index your rewrite gets. What the clock compares is the pagination technique
and nothing else. Exercise 4 is the deliberate exception - there the missing
index is the whole problem, and it is yours to write.
"""
import pytest

from dojo import grader, timing
from dojo.lesson import Lesson
from dojo.plan import explain

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    L.apply_setup(lesson_db)             # the feed index, applied before the clock
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex1",
                                      ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan', 'Sort'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex2(lesson_db):
    # No clock and no index here: a missing tiebreak does not make a page
    # slow, it makes it wrong. 10,000 products are enough to prove that.
    ex = L.exercise("ex2")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)


def test_ex3(lesson_db):
    ex = L.exercise("ex3")
    L.apply_setup(lesson_db)
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex3",
                                      ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan', 'Sort'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex4(lesson_db):
    # Same setup.sql, same order - and this time the feed index buys the
    # baseline nothing, because the query filters as well as sorts. Your
    # index goes in ex4/indexes.sql; the query is provided and does not change.
    ex = L.exercise("ex4")
    L.apply_setup(lesson_db)
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex4",
                                      ex.expected_sql)
    ex.apply_indexes(lesson_db)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
    p = explain(lesson_db, ex.solution_sql)
    grader.assert_plan(p, must_not_have=['Seq Scan', 'Sort'])
    measured = timing.measure_execution_ms(lesson_db, ex.solution_sql)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


@pytest.mark.challenge
def test_challenge(lesson_db):
    # Correctness only: sixty rows, nothing skipped, nothing repeated, in
    # order. The provided index keeps each page a seek instead of a sort.
    ex = L.exercise("challenge")
    ex.apply_indexes(lesson_db)
    expected = ex.fetch(lesson_db, ex.expected_sql)
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected, ordered=True)
