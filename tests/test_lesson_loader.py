from pathlib import Path

from dojo.lesson import Exercise, Lesson


def make_lesson(tmp_path: Path) -> Path:
    ldir = tmp_path / "08_inner_joins"
    (ldir / "ex1").mkdir(parents=True)
    (ldir / "ex1" / "solution.sql").write_text("SELECT 1;")
    (ldir / "ex1" / "expected.sql").write_text("SELECT 2;")
    (ldir / "ex1" / "hints.md").write_text("## Hint 1\nnudge\n")
    (ldir / "setup.sql").write_text("CREATE TABLE t (x int);")
    (ldir / "test_lesson.py").write_text("")
    return ldir


def test_lesson_slug_and_setup(tmp_path):
    ldir = make_lesson(tmp_path)
    lesson = Lesson(ldir / "test_lesson.py")
    assert lesson.slug == "08_inner_joins"
    assert "CREATE TABLE" in lesson.setup_sql


def test_exercise_files(tmp_path):
    ldir = make_lesson(tmp_path)
    ex = Lesson(ldir / "test_lesson.py").exercise("ex1")
    assert ex.solution_sql == "SELECT 1;"
    assert ex.expected_sql == "SELECT 2;"
    assert ex.indexes_sql == ""  # absent file -> ""
    assert ex.hints_path.name == "hints.md"
    assert ex.reference_dir.name == ".reference"


def test_absent_files_return_empty(tmp_path):
    ex = Exercise(tmp_path / "nowhere")
    assert ex.solution_sql == ""
    assert ex.expected_sql == ""
    assert ex.indexes_sql == ""


def test_fetch_returns_last_result_set(template_conn):
    ex = Exercise(Path("."))
    rows = ex.fetch(template_conn, "SELECT 1 AS a; SELECT 2 AS b, 3 AS c;")
    assert rows == [(2, 3)]
