import pytest

from dojo import grader
from dojo.plan import Plan


# -- assert_rows_equal ------------------------------------------------------

def test_rows_equal_pass():
    grader.assert_rows_equal([(1, "a"), (2, "b")], [(1, "a"), (2, "b")])


def test_rows_equal_unordered_pass():
    grader.assert_rows_equal([(2, "b"), (1, "a")], [(1, "a"), (2, "b")], ordered=False)


def test_rows_wrong_order_message():
    with pytest.raises(AssertionError) as e:
        grader.assert_rows_equal([(2,), (1,)], [(1,), (2,)], ordered=True)
    msg = str(e.value)
    assert "WRONG ORDER" in msg
    assert "ORDER BY" in msg


def test_column_count_mismatch_message():
    with pytest.raises(AssertionError) as e:
        grader.assert_rows_equal([(1, 2, 3, 4)], [(1, 2, 3)])
    msg = str(e.value)
    assert "4 columns" in msg
    assert "expected 3" in msg
    assert "SELECT list" in msg


def test_row_count_mismatch_message():
    with pytest.raises(AssertionError) as e:
        grader.assert_rows_equal([(1,)], [(1,), (2,), (3,)])
    msg = str(e.value)
    assert "Expected 3 rows" in msg
    assert "returned 1 rows" in msg
    assert "MISSING" in msg


def test_content_differs_shows_first_diff():
    with pytest.raises(AssertionError) as e:
        grader.assert_rows_equal([(1, "x")], [(1, "y")])
    msg = str(e.value)
    assert "content differs" in msg
    assert "'y'" in msg and "'x'" in msg


def test_jsonb_cells_compare():
    grader.assert_rows_equal([({"a": 1, "b": 2},)], [({"b": 2, "a": 1},)])


# -- assert_plan ------------------------------------------------------------

def test_plan_pass(canned_plan):
    p = Plan(canned_plan)
    grader.assert_plan(p, must_have=["Hash Join"], uses_index="customers_pkey")


def test_plan_must_not_have_message(canned_plan):
    p = Plan(canned_plan)
    with pytest.raises(AssertionError) as e:
        grader.assert_plan(p, must_not_have=["Seq Scan"])
    msg = str(e.value)
    assert "Seq Scan" in msg
    assert "whole table" in msg          # guidance sentence
    assert "Seq Scan on orders" in msg   # rendered plan evidence


def test_plan_must_have_message(canned_plan):
    p = Plan(canned_plan)
    with pytest.raises(AssertionError) as e:
        grader.assert_plan(p, must_have=["Bitmap Heap Scan"])
    assert "Bitmap Heap Scan" in str(e.value)


def test_plan_uses_index_message(canned_plan):
    p = Plan(canned_plan)
    with pytest.raises(AssertionError) as e:
        grader.assert_plan(p, uses_index="orders_status_idx")
    msg = str(e.value)
    assert "orders_status_idx" in msg
    assert "customers_pkey" in msg


# -- assert_faster_than_baseline ---------------------------------------------

def test_speed_pass():
    grader.assert_faster_than_baseline(10.0, 100.0, ratio=8)


def test_speed_fail_message():
    with pytest.raises(AssertionError) as e:
        grader.assert_faster_than_baseline(50.0, 100.0, ratio=8)
    msg = str(e.value)
    assert "TOO SLOW" in msg
    assert "100.0ms" in msg
    assert "50.0ms" in msg
    assert "8x" in msg
    assert "2.0x" in msg  # achieved multiple


def test_speed_skips_below_floor():
    with pytest.raises(pytest.skip.Exception):
        grader.assert_faster_than_baseline(1.0, 1.5, ratio=8, floor_ms=2.0)

