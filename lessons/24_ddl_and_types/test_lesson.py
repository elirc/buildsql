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
