"""Gates for 21_insert_update_delete. Quoted verbatim in README.md."""
import pytest

from dojo import grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM products WHERE id IN (20001, 20002, 20003)",
        3, "all three new products exist")
    grader.assert_scalar(
        lesson_db, "SELECT name FROM products WHERE id = 20002",
        "Dojo Mug", "product 20002 is the mug")
    grader.assert_scalar(
        lesson_db, "SELECT category FROM products WHERE id = 20003",
        "books", "product 20003 sits in books")
    grader.assert_scalar(
        lesson_db,
        "SELECT sum(price) FROM products WHERE id IN (20001, 20002, 20003)",
        54, "prices add up (25.00 + 12.50 + 16.50)")


def test_ex2(lesson_db):
    target_where = """
        category = 'garden'
        AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = products.id)
    """
    expected_target = lesson_db.execute(
        f"SELECT sum(round(price * 0.9, 2)) FROM products WHERE {target_where}"
    ).fetchone()[0]
    untouched_before = lesson_db.execute(
        f"SELECT sum(price) FROM products WHERE NOT ({target_where})"
    ).fetchone()[0]

    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(
        lesson_db,
        f"SELECT sum(price) FROM products WHERE {target_where}",
        expected_target, "never-ordered garden products got exactly 10% off, rounded")
    grader.assert_scalar(
        lesson_db,
        f"SELECT sum(price) FROM products WHERE NOT ({target_where})",
        untouched_before, "every other product's price is untouched")


def test_ex3(lesson_db):
    doomed = lesson_db.execute(
        "SELECT count(*) FROM reviews WHERE product_id = 42 AND rating = 1"
    ).fetchone()[0]
    total = lesson_db.execute("SELECT count(*) FROM reviews").fetchone()[0]
    assert doomed > 0  # seed guarantees product 42 has 1-star reviews

    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM reviews WHERE product_id = 42 AND rating = 1",
        0, "the 1-star reviews of product 42 are gone")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM reviews",
        total - doomed, "exactly the doomed reviews were deleted - no more, no less")


@pytest.mark.challenge
def test_challenge(lesson_db):
    src = lesson_db.execute(
        "SELECT customer_id, total FROM orders WHERE id = 123").fetchone()
    src_items = lesson_db.execute(
        "SELECT product_id, quantity, price FROM order_items "
        "WHERE order_id = 123 ORDER BY product_id, id").fetchall()

    ex = L.exercise("challenge")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM orders WHERE id = 600001 AND status = 'pending' "
        "AND customer_id = %d AND total = %s" % (src[0], src[1]),
        1, "order 600001 mirrors order 123 (same customer and total, status pending)")
    new_items = lesson_db.execute(
        "SELECT product_id, quantity, price FROM order_items "
        "WHERE order_id = 600001 ORDER BY product_id, id").fetchall()
    grader.assert_rows_equal(new_items, src_items, ordered=True)
