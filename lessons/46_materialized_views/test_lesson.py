"""Gates for 46_materialized_views. Quoted verbatim in README.md."""
from dojo import grader, timing
from dojo.lesson import Lesson

L = Lesson(__file__)

PROBE = "SELECT category, revenue FROM category_rev"


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    expected = ex.fetch(lesson_db, ex.expected_sql)
    baseline = timing.cached_baseline(lesson_db, f"{L.slug}::test_ex1",
                                      ex.expected_sql)
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    actual = ex.fetch(lesson_db, PROBE)
    grader.assert_rows_equal(actual, expected)
    measured = timing.measure_execution_ms(lesson_db, PROBE)
    grader.assert_faster_than_baseline(measured, baseline, ratio=8)


def test_ex2(lesson_db):
    lesson_db.execute(L.exercise("ex1").solution_sql)
    lesson_db.commit()
    ex = L.exercise("ex2")

    # the world changes AFTER the materialized view was built
    lesson_db.execute(
        "INSERT INTO order_items (id, order_id, product_id, quantity, price) "
        "SELECT 5000000 + gs, 123, 1, 3, 100.00 FROM generate_series(1, 50) gs")
    lesson_db.commit()

    fresh = lesson_db.execute(L.exercise("ex1").expected_sql).fetchall()
    lesson_db.execute(ex.solution_sql)   # must REFRESH
    lesson_db.commit()
    actual = ex.fetch(lesson_db, PROBE)
    grader.assert_rows_equal(actual, fresh)


def test_ex3(lesson_db):
    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM pg_matviews WHERE matviewname = 'country_rev'",
        1, "country_rev exists and is a MATERIALIZED view")
    expected = lesson_db.execute("""
        SELECT c.country, sum(o.total)
        FROM orders o
        JOIN customers c ON c.id = o.customer_id
        WHERE o.status IN ('paid', 'shipped')
        GROUP BY c.country
    """).fetchall()
    actual = lesson_db.execute(
        "SELECT country, revenue FROM country_rev").fetchall()
    grader.assert_rows_equal(actual, expected)
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM pg_index i JOIN pg_class c ON c.oid = i.indrelid "
        "WHERE c.relname = 'country_rev' AND i.indisunique",
        1,
        "no UNIQUE index on the matview - without one, REFRESH CONCURRENTLY "
        "is impossible and every refresh locks readers out")


def test_ex4(lesson_db):
    from dojo import db as _db

    lesson_db.execute(L.exercise("ex3").solution_sql)
    lesson_db.commit()
    stale = lesson_db.execute(
        "SELECT revenue FROM country_rev WHERE country = 'US'").fetchone()[0]

    # new paid orders arrive behind the matview's back
    lesson_db.execute(
        "INSERT INTO orders (id, customer_id, status, total, created_at) "
        "SELECT 900000 + i, (SELECT min(id) FROM customers WHERE country = 'US'), "
        "'paid', 100.00, '2023-11-15' FROM generate_series(1, 10) AS i")
    lesson_db.commit()

    ex = L.exercise("ex4")
    assert "concurrently" in ex.solution_sql.lower(), (
        "This exercise is about the non-blocking refresh: a plain REFRESH "
        "MATERIALIZED VIEW takes an ACCESS EXCLUSIVE lock and makes the view "
        "unreadable for the whole rebuild."
    )
    # REFRESH ... CONCURRENTLY cannot run inside a transaction block
    with _db.connect(lesson_db.info.dbname, autocommit=True) as rconn:
        rconn.execute(ex.solution_sql)

    fresh = lesson_db.execute(
        "SELECT revenue FROM country_rev WHERE country = 'US'").fetchone()[0]
    assert fresh == stale + 1000, (
        f"MATVIEW STILL STALE: US revenue was {stale} and is {fresh}; the ten "
        f"new 100.00 orders should have raised it to {stale + 1000}."
    )
    expected = lesson_db.execute("""
        SELECT c.country, sum(o.total)
        FROM orders o
        JOIN customers c ON c.id = o.customer_id
        WHERE o.status IN ('paid', 'shipped')
        GROUP BY c.country
    """).fetchall()
    actual = lesson_db.execute(
        "SELECT country, revenue FROM country_rev").fetchall()
    grader.assert_rows_equal(actual, expected)
