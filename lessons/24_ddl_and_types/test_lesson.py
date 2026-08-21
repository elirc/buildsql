"""Gates for 24_ddl_and_types. Quoted verbatim in README.md."""
from dojo import catalog, grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "coupons", {
        "code": "text",
        "percent_off": "numeric",
        "starts_on": "date",
        "expires_on": "date",
        "notes": "text",
    })
    catalog.assert_pk(lesson_db, "coupons", ["code"])
    catalog.assert_not_null(lesson_db, "coupons", "percent_off")
    catalog.assert_not_null(lesson_db, "coupons", "starts_on")
    catalog.assert_not_null(lesson_db, "coupons", "expires_on")
    catalog.accepts(
        lesson_db,
        "INSERT INTO coupons (code, percent_off, starts_on, expires_on) "
        "VALUES ('WELCOME10', 10.00, '2023-11-01', '2023-12-01')",
        why="a normal coupon, notes omitted (nullable)")


def test_ex2(lesson_db):
    ex = L.exercise("ex2")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "ledger", {
        "id": "int",
        "amount_float": "double precision",
        "amount_numeric": "numeric",
    })
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM ledger",
        10, "ten rows of 0.10 each")
    grader.assert_scalar(
        lesson_db, "SELECT sum(amount_numeric) = 1.00 FROM ledger",
        True, "numeric: ten dimes make exactly one dollar")
    grader.assert_scalar(
        lesson_db, "SELECT sum(amount_float) = 1.0 FROM ledger",
        False, "float: ten dimes do NOT make a dollar - that's the lesson")


def test_ex3(lesson_db):
    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "subscriptions", {
        "id": "int",
        "customer_id": "int",
        "plan": "text",
        "is_active": "boolean",
        "started_at": "timestamp with time zone",
        "renews_on": "date",
    })
    catalog.assert_pk(lesson_db, "subscriptions", ["id"])
    catalog.assert_fk(lesson_db, "subscriptions", ["customer_id"], "customers")
    catalog.assert_not_null(lesson_db, "subscriptions", "plan")
    catalog.assert_not_null(lesson_db, "subscriptions", "is_active")
    catalog.assert_check(lesson_db, "subscriptions", "plan")
    catalog.rejects(
        lesson_db,
        "INSERT INTO subscriptions (id, customer_id, plan, started_at) "
        "VALUES (1, 1, 'enterprise', '2023-11-14')",
        why="'enterprise' is not one of the three plans the CHECK allows")
    lesson_db.execute("SAVEPOINT default_probe")
    lesson_db.execute(
        "INSERT INTO subscriptions (id, customer_id, plan, started_at) "
        "VALUES (1, 1, 'pro', '2023-11-14')")
    grader.assert_scalar(
        lesson_db, "SELECT is_active FROM subscriptions WHERE id = 1",
        True, "is_active defaults to true when the INSERT omits it")
    grader.assert_scalar(
        lesson_db, "SELECT renews_on FROM subscriptions WHERE id = 1",
        None, "renews_on is nullable and stays NULL when omitted")
    lesson_db.execute("ROLLBACK TO SAVEPOINT default_probe")


def test_ex4(lesson_db):
    ex = L.exercise("ex4")
    lesson_db.execute(ex.solution_sql)
    catalog.assert_table(lesson_db, "invoices", {
        "id": "int", "subtotal": "numeric", "tax": "numeric", "total": "numeric"})
    catalog.assert_pk(lesson_db, "invoices", ["id"])
    catalog.rejects(
        lesson_db,
        "INSERT INTO invoices (subtotal, tax, total) VALUES (100.00, 20.00, 999.00)",
        why="a generated column cannot be written - that is the entire point")
    lesson_db.execute(
        "INSERT INTO invoices (subtotal, tax) VALUES (100.00, 20.00), (5.50, 0.50)")
    grader.assert_scalar(
        lesson_db, "SELECT total FROM invoices WHERE subtotal = 100.00",
        120, "total is computed as subtotal + tax")
    grader.assert_scalar(
        lesson_db, "SELECT count(DISTINCT id) FROM invoices",
        2, "IDENTITY assigned two distinct ids without being asked")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM invoices WHERE id IS NULL",
        0, "IDENTITY always produces a value")
