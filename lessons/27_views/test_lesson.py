"""Gates for 27_views. Quoted verbatim in README.md."""
from dojo import catalog, grader
from dojo.lesson import Lesson

L = Lesson(__file__)

SPEND_QUERY = """
    SELECT c.id, c.name,
           coalesce(sum(o.total) FILTER (WHERE o.status IN ('paid', 'shipped')), 0)
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id
    GROUP BY c.id, c.name
"""


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_view(lesson_db, "customer_spend")
    expected = lesson_db.execute(SPEND_QUERY).fetchall()
    actual = lesson_db.execute(
        "SELECT customer_id, name, spend FROM customer_spend").fetchall()
    grader.assert_rows_equal(actual, expected)


def test_ex2(lesson_db):
    lesson_db.execute(L.exercise("ex1").solution_sql)
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_view(lesson_db, "top_spenders")
    expected = lesson_db.execute(
        f"SELECT * FROM ({SPEND_QUERY}) t(customer_id, name, spend) "
        "WHERE spend > 20000").fetchall()
    actual = lesson_db.execute(
        "SELECT customer_id, name, spend FROM top_spenders").fetchall()
    grader.assert_rows_equal(actual, expected)


def test_ex3(lesson_db):
    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_view(lesson_db, "category_revenue")
    expected = lesson_db.execute("""
        SELECT p.category, sum(oi.quantity * oi.price)
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p     ON p.id = oi.product_id
        WHERE o.status IN ('paid', 'shipped')
        GROUP BY p.category
    """).fetchall()
    actual = lesson_db.execute(
        "SELECT category, revenue FROM category_revenue").fetchall()
    grader.assert_rows_equal(actual, expected)


def test_ex4(lesson_db):
    ex = L.exercise("ex4")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_view(lesson_db, "active_customers")
    expected = lesson_db.execute("""
        SELECT c.id, c.name, c.country
        FROM customers c
        WHERE EXISTS (SELECT 1 FROM orders o
                      WHERE o.customer_id = c.id
                        AND o.status IN ('paid', 'shipped'))
    """).fetchall()
    actual = lesson_db.execute(
        "SELECT id, name, country FROM active_customers").fetchall()
    grader.assert_rows_equal(actual, expected)
