"""End-to-end: clone the template and run a trivial gate."""
from dojo import db, grader
from dojo.plan import explain


def test_clone_run_gate_drop(lesson_db):
    # correctness-style gate: same query both sides
    expected = lesson_db.execute("SELECT count(*) FROM customers").fetchall()
    actual = lesson_db.execute("SELECT count(*) FROM customers").fetchall()
    grader.assert_rows_equal(actual, expected)
    assert expected[0][0] > 0


def test_explain_against_clone(lesson_db):
    p = explain(lesson_db, "SELECT * FROM customers WHERE id = 42")
    # id is the PK, so this must be an index scan
    assert p.uses_index("customers_pkey")
    assert p.execution_time_ms is not None
    assert "customers" in p.render()


def test_clone_isolation(lesson_db):
    lesson_db.execute("CREATE TABLE scratch_leak_check (x int)")
    lesson_db.commit()
    # the template itself must not gain the table
    from dojo.config import load_config

    with db.connect(load_config().template_db) as tconn:
        row = tconn.execute(
            "SELECT 1 FROM pg_tables WHERE tablename = 'scratch_leak_check'"
        ).fetchone()
        assert row is None
