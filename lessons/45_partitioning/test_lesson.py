"""Gates for 45_partitioning. Quoted verbatim in README.md."""
from dojo import grader
from dojo.lesson import Lesson
from dojo.plan import explain

L = Lesson(__file__)


def test_ex1(lesson_db):
    ex = L.exercise("ex1")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    grader.assert_scalar(
        lesson_db,
        "SELECT relkind = 'p' FROM pg_class WHERE relname = 'events_p'",
        True, "events_p is a PARTITIONED table (relkind 'p'), not a plain one")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) >= 2 FROM pg_inherits i "
        "JOIN pg_class parent ON parent.oid = i.inhparent "
        "WHERE parent.relname = 'events_p'",
        True, "events_p has at least two partitions attached")
    grader.assert_scalar(
        lesson_db,
        "SELECT (SELECT count(*) FROM events_p) = (SELECT count(*) FROM events)",
        True, "every event made it into the partitioned copy")


def test_ex2(lesson_db):
    lesson_db.execute(L.exercise("ex1").solution_sql)
    lesson_db.commit()
    ex = L.exercise("ex2")
    expected = lesson_db.execute(
        "SELECT count(*) FROM events "
        "WHERE ts >= '2023-11-01' AND ts < '2023-11-08'").fetchall()
    actual = ex.fetch(lesson_db, ex.solution_sql)
    grader.assert_rows_equal(actual, expected)

    p = explain(lesson_db, ex.solution_sql)
    scanned = [n.get("Relation Name") for n in p.nodes() if n.get("Relation Name")]
    assert "events_p_oct" not in scanned, (
        "NO PRUNING: the plan scans events_p_oct, but the query only wants "
        "November - partition pruning should have skipped October entirely.\n"
        "  Does your WHERE filter on the PARTITION KEY (ts) with plain "
        "comparisons the planner can prove?\n\nPlan:\n" + p.render()
    )


def test_ex3(lesson_db):
    lesson_db.execute(L.exercise("ex1").solution_sql)
    lesson_db.commit()
    ex = L.exercise("ex3")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) >= 3 FROM pg_inherits i "
        "JOIN pg_class parent ON parent.oid = i.inhparent "
        "WHERE parent.relname = 'events_p'",
        True, "events_p has at least three partitions attached")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM pg_inherits i "
        "JOIN pg_class parent ON parent.oid = i.inhparent "
        "JOIN pg_class child ON child.oid = i.inhrelid "
        "WHERE parent.relname = 'events_p' AND child.relname = 'events_p_dec'",
        1, "events_p_dec is attached to events_p as a partition")
    lesson_db.execute("SAVEPOINT dec_probe")
    lesson_db.execute(
        "INSERT INTO events_p (id, customer_id, event_type, payload, ts) "
        "VALUES (99000001, 1, 'view', '{}'::jsonb, '2023-12-15 10:00+00')")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM events_p_dec WHERE id = 99000001",
        1, "a December row routes into the December partition automatically")
    lesson_db.execute("ROLLBACK TO SAVEPOINT dec_probe")


def test_ex4(lesson_db):
    lesson_db.execute(L.exercise("ex1").solution_sql)
    lesson_db.commit()
    november = lesson_db.execute(
        "SELECT count(*) FROM events WHERE ts >= '2023-11-01'").fetchone()[0]

    ex = L.exercise("ex4")
    lesson_db.execute(ex.solution_sql)
    lesson_db.commit()

    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM pg_inherits i "
        "JOIN pg_class parent ON parent.oid = i.inhparent "
        "JOIN pg_class child ON child.oid = i.inhrelid "
        "WHERE parent.relname = 'events_p' AND child.relname = 'events_p_oct'",
        0, "events_p_oct is no longer attached to events_p")
    grader.assert_scalar(
        lesson_db,
        "SELECT count(*) FROM pg_class WHERE relname = 'events_p_oct'",
        1, "but the table itself still exists - DETACH is not DROP")
    grader.assert_scalar(
        lesson_db, "SELECT count(*) FROM events_p", november,
        "events_p now holds only the November rows, and not one row was "
        "rewritten to make that true")
