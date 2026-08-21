"""Gates for 28_altering_live_schemas. Quoted verbatim in README.md."""
from dojo import catalog, grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(lesson_db):
    # measured, not hard-coded, so the gate holds at any DOJO_SCALE
    vips = lesson_db.execute(
        "SELECT count(*) FROM (SELECT customer_id FROM orders "
        "GROUP BY customer_id HAVING count(*) > 20) t").fetchone()[0]
    everyone = lesson_db.execute("SELECT count(*) FROM customers").fetchone()[0]

    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "customers", {"loyalty_tier": "text"})
    catalog.assert_not_null(lesson_db, "customers", "loyalty_tier")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM customers WHERE loyalty_tier = 'vip'",
        vips, "exactly the >20-order customers are vip")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM customers WHERE loyalty_tier = 'member'",
        everyone - vips, "everyone else is member")


def test_ex2(lesson_db):
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_check(lesson_db, "orders", "total")
    grader.assert_scalar(
        lesson_db,
        "SELECT convalidated FROM pg_constraint "
        "WHERE conname = 'orders_total_min'",
        True, "the constraint was VALIDATEd, not left NOT VALID forever")
    catalog.rejects(
        lesson_db,
        "INSERT INTO orders (id, customer_id, status, total, created_at) "
        "VALUES (900001, 1, 'pending', 1.00, '2023-11-15')",
        why="new orders under the 5.00 minimum must be refused")


def test_ex3(lesson_db):
    rows = lesson_db.execute("SELECT count(*) FROM products").fetchone()[0]
    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "products", {"is_archived": "boolean"})
    catalog.assert_not_null(lesson_db, "products", "is_archived")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM products WHERE is_archived = false",
        rows, "every existing row reads as false without a rewrite")
    lesson_db.execute("SAVEPOINT default_probe")
    lesson_db.execute(
        "INSERT INTO products (id, name, category, price, description, attributes) "
        "VALUES (99001, 'Probe', 'books', 1.00, 'x', '{}'::jsonb)")
    grader.assert_scalar(
        lesson_db, "SELECT is_archived FROM products WHERE id = 99001",
        False, "new rows get the default too")
    lesson_db.execute("ROLLBACK TO SAVEPOINT default_probe")


def test_ex4(lesson_db):
    size_before = lesson_db.execute(
        "SELECT pg_relation_size('reviews')").fetchone()[0]
    rows_before = lesson_db.execute("SELECT count(*) FROM reviews").fetchone()[0]
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM information_schema.columns "
        "WHERE table_name = 'reviews' AND column_name = 'body'",
        1, "the body column is there to begin with")

    ex = L.exercise("ex4")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM information_schema.columns "
        "WHERE table_name = 'reviews' AND column_name = 'body'",
        0, "the column is gone from the catalog")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM reviews", rows_before,
        "and every row is still there - this was a catalog change, not a rewrite")
    grader.assert_scalar(
        lesson_db, "SELECT pg_relation_size('reviews')", size_before,
        "the table is exactly the same size on disk: DROP COLUMN is logical, "
        "and the bytes come back only when each row is next rewritten")
