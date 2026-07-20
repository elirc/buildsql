"""`dojo plan` - print EXPLAIN for the current solution, no gate."""
from __future__ import annotations

from dojo import db
from dojo.config import ROOT
from dojo.lesson import Lesson
from dojo.plan import explain


def show_plan(slug: str, exercise: str = "ex1") -> int:
    lesson = Lesson(ROOT / "lessons" / slug / "test_lesson.py")
    ex = lesson.exercise(exercise)
    sol = ex.solution_sql.strip()
    if not sol:
        print(f"No solution.sql found for {slug}/{exercise}.")
        return 1
    clone = f"dojo_plan_{slug}"
    db.clone_template(clone)
    try:
        with db.connect(clone, autocommit=True) as conn:
            if lesson.setup_sql.strip():
                lesson.apply_setup(conn)
            if ex.indexes_sql.strip():
                print("-- applying your indexes.sql --")
                ex.apply_indexes(conn)
            p = explain(conn, sol)
            print(p.render())
            print()
            print(f"Planning time:  {p.planning_time_ms:.2f} ms")
            print(f"Execution time: {p.execution_time_ms:.2f} ms")
        return 0
    finally:
        db.drop_database(clone)
