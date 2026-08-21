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


def test_ex3(lesson_db):
    L.apply_setup(lesson_db)
    lesson_db.execute(L.exercise("ex1").solution_sql)
    lesson_db.execute(L.exercise("ex2").solution_sql)
    br_customers = lesson_db.execute(
        "SELECT count(*) FROM n_customers WHERE country = 'BR'").fetchone()[0]
    br_flat_rows = lesson_db.execute(
        "SELECT count(*) FROM flat_orders WHERE customer_country = 'BR'"
    ).fetchone()[0]
    assert br_customers > 0 and br_flat_rows > br_customers

    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM n_customers WHERE country = 'BR'",
        0, "no Brazilian customers are left under the old code")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM n_customers WHERE country = 'BR2'",
        br_customers, "exactly the Brazilian customers moved - one row each")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM flat_orders WHERE customer_country = 'BR'",
        br_flat_rows,
        "flat_orders is untouched - it would have needed every one of these "
        "rows updated, and any one of them could have been missed")


def test_ex4(lesson_db):
    L.apply_setup(lesson_db)
    lesson_db.execute(L.exercise("ex1").solution_sql)
    lesson_db.execute(L.exercise("ex2").solution_sql)
    products_before = lesson_db.execute(
        "SELECT count(DISTINCT product_name) FROM n_lines").fetchone()[0]
    lines_before = lesson_db.execute("SELECT count(*) FROM n_lines").fetchone()[0]

    ex = L.exercise("ex4")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    catalog.assert_table(lesson_db, "n_products", {
        "product_name": "text", "category": "text"})
    catalog.assert_pk(lesson_db, "n_products", ["product_name"])
    catalog.assert_not_null(lesson_db, "n_products", "category")
    catalog.assert_fk(lesson_db, "n_lines", ["product_name"], "n_products")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM n_products", products_before,
        "one row per distinct product name, no duplicates and none lost")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM n_lines", lines_before,
        "the line items themselves are unchanged")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM information_schema.columns "
        "WHERE table_name = 'n_lines' AND column_name = 'category'",
        0, "n_lines.category is gone - the category now lives with the product")
    catalog.rejects(
        lesson_db,
        "INSERT INTO n_lines (order_id, product_name, quantity, unit_price) "
        "VALUES (1, 'No Such Product 999999', 1, 1.00)",
        why="the new foreign key must refuse a line for a product that "
            "does not exist")
