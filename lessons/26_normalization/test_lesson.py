"""Gates for 26_normalization. Quoted verbatim in README.md."""
from dojo import catalog, grader
from dojo.lesson import Lesson

L = Lesson(__file__)

RECONSTRUCT = """
    SELECT no.order_id, nc.name, nc.email, nc.country,
           nl.product_name, nl.category, nl.quantity, nl.unit_price
    FROM n_lines nl
    JOIN n_orders no    ON no.order_id = nl.order_id
    JOIN n_customers nc ON nc.email = no.customer_email
"""

ORIGINAL = """
    SELECT order_id, customer_name, customer_email, customer_country,
           product_name, product_category, quantity, unit_price
    FROM flat_orders
"""


def test_ex1(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "n_customers", {
        "email": "text", "name": "text", "country": "text"})
    catalog.assert_pk(lesson_db, "n_customers", ["email"])
    catalog.assert_table(lesson_db, "n_orders", {
        "order_id": "int", "customer_email": "text"})
    catalog.assert_pk(lesson_db, "n_orders", ["order_id"])
    catalog.assert_fk(lesson_db, "n_orders", ["customer_email"], "n_customers")
    catalog.assert_table(lesson_db, "n_lines", {
        "order_id": "int", "product_name": "text", "category": "text",
        "quantity": "bigint", "unit_price": "numeric"})
    catalog.assert_pk(lesson_db, "n_lines", ["order_id", "product_name"])
    catalog.assert_fk(lesson_db, "n_lines", ["order_id"], "n_orders")
    catalog.rejects(
        lesson_db,
        "INSERT INTO n_orders (order_id, customer_email) "
        "VALUES (999999, 'ghost@example.com')",
        why="an order pointing at a customer that doesn't exist")


def test_ex2(lesson_db):
    L.apply_setup(lesson_db)
    lesson_db.execute(L.exercise("ex1").solution_sql)
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    expected = lesson_db.execute(ORIGINAL).fetchall()
    actual = lesson_db.execute(RECONSTRUCT).fetchall()
    grader.assert_rows_equal(actual, expected)
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) = count(DISTINCT email) FROM n_customers",
        True, "each customer stored exactly once")
