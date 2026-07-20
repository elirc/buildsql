"""Gates for 44_mvcc_vacuum_bloat. Quoted verbatim in README.md.

VACUUM cannot run inside a transaction, so your solution runs on a
separate autocommit connection. Dead-tuple stats flow through the
cumulative stats system with a tiny lag; the gate polls briefly.
"""
import time

from dojo import db, grader
from dojo.lesson import Lesson

L = Lesson(__file__)


def _dead_tuples(dbname, wait_for_positive=True):
    # pg_stat views are snapshot-cached per transaction, so polling must
    # happen on an AUTOCOMMIT connection (each query = fresh snapshot).
    with db.connect(dbname, autocommit=True) as conn:
        n = 0
        for _ in range(40):
            n = conn.execute(
                "SELECT n_dead_tup FROM pg_stat_user_tables "
                "WHERE relname = 'bloat_orders'").fetchone()[0] or 0
            if not wait_for_positive or n > 0:
                return n
            time.sleep(0.25)
        return n


def test_ex1(lesson_db):
    L.apply_setup(lesson_db)
    lesson_db.execute("UPDATE bloat_orders SET total = total + 1")
    lesson_db.commit()
    dead_before = _dead_tuples(lesson_db.info.dbname)
    assert dead_before >= 90000, "setup: the UPDATE should leave ~100k dead tuples"

    ex = L.exercise("ex1")
    with db.connect(lesson_db.info.dbname, autocommit=True) as vconn:
        vconn.execute(ex.solution_sql)

    time.sleep(0.5)
    dead_after = _dead_tuples(lesson_db.info.dbname, wait_for_positive=False)
    assert dead_after <= dead_before * 0.1, (
        f"DEAD TUPLES REMAIN: {dead_before:,} before your solution, "
        f"{dead_after:,} after - expected a >=90% drop.\n"
        "  The one-word statement that reclaims dead tuples is the lesson."
    )


def test_ex2(lesson_db):
    L.apply_setup(lesson_db)
    lesson_db.execute("UPDATE bloat_orders SET total = total + 1")
    lesson_db.commit()
    size_before = lesson_db.execute(
        "SELECT pg_relation_size('bloat_orders')").fetchone()[0]

    ex = L.exercise("ex2")
    with db.connect(lesson_db.info.dbname, autocommit=True) as vconn:
        vconn.execute(ex.solution_sql)

    size_after = lesson_db.execute(
        "SELECT pg_relation_size('bloat_orders')").fetchone()[0]
    assert size_after < size_before * 0.7, (
        f"FILE DID NOT SHRINK: {size_before:,} bytes before, {size_after:,} after.\n"
        "  Plain VACUUM reclaims space for REUSE but rarely returns it to the OS.\n"
        "  The variant that rewrites the table compactly is what this exercise wants\n"
        "  - and note what it costs: an exclusive lock for the whole rewrite."
    )
