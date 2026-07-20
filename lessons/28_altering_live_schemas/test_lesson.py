"""Gates for 28_altering_live_schemas. Quoted verbatim in README.md."""
from dojo import catalog, grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "customers", {"loyalty_tier": "text"})
    catalog.assert_not_null(lesson_db, "customers", "loyalty_tier")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM customers WHERE loyalty_tier = 'vip'",
        250, "exactly the >20-order customers are vip")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM customers WHERE loyalty_tier = 'member'",
        49750, "everyone else is member")


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
