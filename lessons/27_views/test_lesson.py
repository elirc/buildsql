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
