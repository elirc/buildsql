"""Gates for 23_transactions. Quoted verbatim in README.md.

These gates run your script on a SEPARATE AUTOCOMMIT connection, so your
own BEGIN/COMMIT/ROLLBACK statements are fully in charge of transaction
boundaries - exactly like a psql session.
"""
import psycopg
import pytest

from dojo import db, grader
from dojo.lesson import Lesson

L = Lesson(__file__)

MARKER = "-- INJECT FAILURE HERE"


def test_ex1(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex1")
    with db.connect(lesson_db.info.dbname, autocommit=True) as tx_conn:
        tx_conn.execute(ex.solution_sql)
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 1",
                         650, "Alice: 900 - 250")
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 2",
                         350, "Bob: 100 + 250")
    grader.assert_scalar(lesson_db, "SELECT sum(balance) FROM accounts",
                         1000, "money is neither created nor destroyed")


def test_ex2(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex2")
    script = ex.solution_sql
    assert MARKER in script, (
        "Your script must contain the literal marker line\n"
        f"    {MARKER}\n"
        "between the debit and your recovery handling - the gate injects a "
        "crash at that point to prove your transaction is atomic."
    )
    first_half, _, remainder = script.partition(MARKER)
    with db.connect(lesson_db.info.dbname, autocommit=True) as tx_conn:
        tx_conn.execute(first_half)
        with pytest.raises(psycopg.Error):
            tx_conn.execute("SELECT 1/0")  # the injected disaster
        try:
            tx_conn.execute(remainder)
        except psycopg.errors.InFailedSqlTransaction:
            raise AssertionError(
                "After the injected failure, the transaction is in a failed "
                "state: the ONLY statement PostgreSQL will accept is ROLLBACK. "
                "Your script's remainder must roll the transaction back."
            ) from None
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 1",
                         900, "Alice untouched - the half-done debit must vanish")
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 2",
                         100, "Bob untouched")
