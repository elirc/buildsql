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


def test_ex4(lesson_db):
    target = lesson_db.execute(
        "SELECT count(*) FROM orders o JOIN customers c ON c.id = o.customer_id "
        "WHERE c.country = 'JP' AND o.status = 'pending'").fetchone()[0]
    cancelled_before = lesson_db.execute(
        "SELECT count(*) FROM orders WHERE status = 'cancelled'").fetchone()[0]
    other_pending = lesson_db.execute(
        "SELECT count(*) FROM orders o JOIN customers c ON c.id = o.customer_id "
        "WHERE c.country <> 'JP' AND o.status = 'pending'").fetchone()[0]
    assert target > 0  # the seed guarantees Japanese pending orders exist

    ex = L.exercise("ex4")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM orders o JOIN customers c ON c.id = o.customer_id "
        "WHERE c.country = 'JP' AND o.status = 'pending'",
        0, "no pending Japanese orders remain")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM orders WHERE status = 'cancelled'",
        cancelled_before + target,
        "exactly the Japanese pending orders became cancelled - no more, no less")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM orders o JOIN customers c ON c.id = o.customer_id "
        "WHERE c.country <> 'JP' AND o.status = 'pending'",
        other_pending, "every other country's pending orders are untouched")


def test_ex5(lesson_db):
    doomed_sql = (
        "SELECT count(*) FROM reviews r JOIN products p ON p.id = r.product_id "
        "WHERE p.category = 'garden' AND p.id < 100 AND r.rating = 1")
    doomed = lesson_db.execute(doomed_sql).fetchone()[0]
    total = lesson_db.execute("SELECT count(*) FROM reviews").fetchone()[0]
    assert doomed > 0  # the seed guarantees such reviews exist

    ex = L.exercise("ex5")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(lesson_db, doomed_sql, 0,
                         "the targeted 1-star garden reviews are gone")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM reviews", total - doomed,
        "exactly the targeted reviews were deleted - no more, no less")


def test_ex6(lesson_db):
    ex = L.exercise("ex6")
    before = lesson_db.execute("SELECT count(*) FROM products").fetchone()[0]

    returned = ex.fetch(lesson_db, ex.solution_sql)
    lesson_db.commit()

    assert len(returned) == 3, (
        "RETURNING MISSING OR WRONG: the gate reads the result set your "
        f"statement produced and got {len(returned)} row(s), expected 3.\n"
        "  Add `RETURNING id, name, price` to your UPDATE."
    )
    assert all(len(r) == 3 for r in returned), (
        "RETURNING should hand back three columns: id, name, price."
    )
    assert {r[0] for r in returned} == {11, 22, 33}, (
        f"RETURNING gave ids {sorted(r[0] for r in returned)}, expected 11, 22, 33."
    )
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM products WHERE id IN (11, 22, 33) "
                   "AND price = 9.99",
        3, "all three products are now priced 9.99")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM products", before,
        "an UPDATE must not change the number of rows")


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
