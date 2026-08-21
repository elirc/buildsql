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


def test_ex3(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex3")
    script = ex.solution_sql
    lowered = script.lower()
    assert "begin" in lowered and "rollback" in lowered, (
        "This exercise is about ROLLBACK: your script must open a transaction "
        "with BEGIN, do the two UPDATEs, and abandon it with ROLLBACK."
    )
    assert "update" in lowered, (
        "Roll back some actual work - the script needs the two UPDATEs in it."
    )
    with db.connect(lesson_db.info.dbname, autocommit=True) as tx_conn:
        tx_conn.execute(script)
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 1",
                         900, "Alice untouched - the transaction was abandoned")
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 3",
                         0, "Escrow untouched")
    grader.assert_scalar(lesson_db, "SELECT sum(balance) FROM accounts",
                         1000, "money is neither created nor destroyed")


def test_ex4(lesson_db):
    L.apply_setup(lesson_db)
    ex = L.exercise("ex4")
    script = ex.solution_sql
    assert MARKER in script, (
        "Your script must contain the literal marker line\n"
        f"    {MARKER}\n"
        "just after your SAVEPOINT - the gate injects a crash there."
    )
    assert "savepoint" in script.lower(), (
        "This exercise is about SAVEPOINT. Without one, the injected failure "
        "poisons the whole transaction and ROLLBACK is your only legal move."
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
                "The transaction is still aborted when your remainder runs its "
                "first statement. ROLLBACK TO SAVEPOINT must come first - it is "
                "the one thing PostgreSQL accepts in a failed transaction "
                "besides ROLLBACK."
            ) from None
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 1",
                         750, "Alice: 900 - 100 (escrow, kept) - 50 (Bob)")
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 2",
                         150, "Bob: 100 + 50, the work done AFTER the recovery")
    grader.assert_scalar(lesson_db, "SELECT balance FROM accounts WHERE id = 3",
                         100, "Escrow: the work done BEFORE the savepoint survived")
    grader.assert_scalar(lesson_db, "SELECT sum(balance) FROM accounts",
                         1000, "money is neither created nor destroyed")
