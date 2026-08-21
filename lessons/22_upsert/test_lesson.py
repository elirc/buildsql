"""Gates for 22_upsert. Quoted verbatim in README.md.

Each gate runs your statement TWICE and asserts the second run changed
nothing - upserts must be idempotent or they aren't upserts.
"""
import pytest

from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def _snapshot(conn, table):
    return conn.execute(
        f"SELECT * FROM {table} ORDER BY product_id").fetchall()


def test_ex1(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    first_run = _snapshot(lesson_db, "inventory")

    lesson_db.execute(ex.solution_sql)  # run it AGAIN
    lesson_db.commit()
    grader.assert_rows_equal(_snapshot(lesson_db, "inventory"), first_run,
                             ordered=True)  # idempotent, or it isn't an upsert

    grader.assert_scalar(
        lesson_db, "SELECT stock FROM inventory WHERE product_id = 50",
        75, "existing product 50 overwritten to the stocktake value")
    grader.assert_scalar(
        lesson_db, "SELECT stock FROM inventory WHERE product_id = 150",
        40, "new product 150 inserted with its stocktake value")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM inventory",
        101, "exactly one new row appeared")


def test_ex2(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    first_run = _snapshot(lesson_db, "inventory")

    lesson_db.execute(ex.solution_sql)  # run it AGAIN
    lesson_db.commit()
    grader.assert_rows_equal(_snapshot(lesson_db, "inventory"), first_run,
                             ordered=True)

    grader.assert_scalar(
        lesson_db, "SELECT stock FROM inventory WHERE product_id = 60",
        100, "existing product 60 must NOT be touched by DO NOTHING")
    grader.assert_scalar(
        lesson_db, "SELECT stock FROM inventory WHERE product_id = 200",
        0, "new product 200 registered with stock 0")


def test_ex3(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    first_run = _snapshot(lesson_db, "inventory")

    lesson_db.execute(ex.solution_sql)  # run it AGAIN
    lesson_db.commit()
    grader.assert_rows_equal(_snapshot(lesson_db, "inventory"), first_run,
                             ordered=True)

    grader.assert_scalar(
        lesson_db, "SELECT stock FROM inventory WHERE product_id = 70",
        100, "product 70: 80 is lower than 100, so the row must NOT change")
    grader.assert_scalar(
        lesson_db, "SELECT stock FROM inventory WHERE product_id = 80",
        120, "product 80: 120 beats 100, so it updates")
    grader.assert_scalar(
        lesson_db, "SELECT stock FROM inventory WHERE product_id = 250",
        5, "product 250 is new, so it inserts")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM inventory",
        101, "exactly one new row appeared")


def test_ex4(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex4")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    first_run = _snapshot(lesson_db, "inventory")

    lesson_db.execute(ex.solution_sql)  # run it AGAIN
    lesson_db.commit()
    grader.assert_rows_equal(_snapshot(lesson_db, "inventory"), first_run,
                             ordered=True)

    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM inventory WHERE product_id BETWEEN 95 AND 105 "
        "AND stock = 50",
        11, "all eleven products 95-105 hold stock 50")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM inventory",
        105, "five new rows appeared (101-105) and no others")
    grader.assert_scalar(
        lesson_db, "SELECT stock FROM inventory WHERE product_id = 1",
        100, "products outside the range are untouched")


@pytest.mark.challenge
def test_challenge(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("challenge")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    first_run = _snapshot(lesson_db, "price_watch")

    lesson_db.execute(ex.solution_sql)  # run it AGAIN
    lesson_db.commit()
    grader.assert_rows_equal(_snapshot(lesson_db, "price_watch"), first_run,
                             ordered=True)

    grader.assert_scalar(
        lesson_db, "SELECT best_price FROM price_watch WHERE product_id = 10",
        45, "product 10: 45.00 beats 50.00, so it updates")
    grader.assert_scalar(
        lesson_db, "SELECT best_price FROM price_watch WHERE product_id = 20",
        80, "product 20: 95.00 is worse than 80.00, so it must NOT update")
    grader.assert_scalar(
        lesson_db, "SELECT best_price FROM price_watch WHERE product_id = 40",
        60, "product 40 is new, so it inserts")
