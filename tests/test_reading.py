"""Unit tests for the reading-material parser, renderer, and post-gate button."""
from __future__ import annotations

import io

import pytest
from rich.console import Console

from dojo import curriculum, reading, verify

DOC = """# Reading - 06_aggregates

An aggregate is a fold over a set of rows.

## Notes

Aggregate functions collapse many rows into one value. Every one of them
except `count(*)` ignores NULL inputs, which is why `count(col)` and
`count(*)` disagree the moment a column is nullable.

## ex1 - five folds, one pass

The dashboard row asks five questions of the same 500,000 rows, and the
planner answers all five in a single scan.

### Further reading

- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - the full list.

## ex2 - FILTER scopes an aggregate

`FILTER (WHERE ...)` restricts the rows one aggregate sees without a second
query and without a CASE expression. One pass over the table answers several
differently-scoped questions at once, and the older `sum(CASE WHEN ...)`
idiom does the same job less readably.

## Further reading

- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - the canonical list.
- [FILTER](https://modern-sql.com/feature/filter) - why FILTER beats sum(CASE ...).
- [Window Functions](https://www.postgresql.org/docs/16/tutorial-window.html) - where aggregates go next.
"""


@pytest.fixture()
def doc():
    return reading.parse(DOC, "06_aggregates")


def test_parses_intro_without_the_title(doc):
    assert doc.intro == "An aggregate is a fold over a set of rows."


def test_section_keys_drop_the_title_after_the_dash(doc):
    assert [s.key for s in doc.sections] == [
        "notes", "ex1", "ex2", "further reading",
    ]
    assert doc.get("ex1").title == "five folds, one pass"


def test_exercise_sections_exclude_notes_and_links(doc):
    assert doc.exercise_keys() == ["ex1", "ex2"]


def test_get_is_case_insensitive_and_missing_returns_none(doc):
    assert doc.get("EX1") is doc.get("ex1")
    assert doc.get("ex9") is None


def test_links_are_collected_across_the_whole_document(doc):
    urls = [url for _, url in doc.links()]
    assert "https://modern-sql.com/feature/filter" in urls
    # the ex1 subsection link counts too
    assert urls.count("https://www.postgresql.org/docs/16/functions-aggregate.html") == 2


def test_minutes_is_at_least_one(doc):
    assert doc.get("ex2").minutes >= 1
    assert doc.minutes >= 1


def test_parse_survives_a_document_with_no_sections():
    d = reading.parse("# Reading - 00\n\njust prose")
    assert d.sections == ()
    assert d.intro == "just prose"


# -- rendering -------------------------------------------------------------

def _render(slug, exercise, monkeypatch, document=DOC):
    monkeypatch.setattr(reading, "load", lambda s: reading.parse(document, s))
    out = io.StringIO()
    console = Console(file=out, width=100, force_terminal=False)
    rc = reading.render(slug, exercise, console=console)
    return rc, out.getvalue()


def test_render_exercise_shows_that_section_and_the_links(monkeypatch):
    rc, text = _render("06_aggregates", "ex1", monkeypatch)
    assert rc == 0
    assert "single scan" in text
    assert "Further reading" in text
    assert "CASE expression" not in text  # ex2's body stays out of ex1's reading


def test_render_whole_lesson_shows_every_section(monkeypatch):
    rc, text = _render("06_aggregates", None, monkeypatch)
    assert rc == 0
    assert "CASE expression" in text and "single scan" in text


def test_render_unknown_exercise_falls_back_to_the_lesson(monkeypatch):
    rc, text = _render("06_aggregates", "ex7", monkeypatch)
    assert rc == 0
    assert "no section for 'ex7'" in text
    assert "single scan" in text


def test_render_missing_reading_is_a_soft_failure(monkeypatch):
    monkeypatch.setattr(reading, "load", lambda s: None)
    out = io.StringIO()
    rc = reading.render("99_nope", None, console=Console(file=out, width=100))
    assert rc == 1
    assert "No reading material" in out.getvalue()


# -- the button ------------------------------------------------------------

def test_button_is_shown_on_failure_and_names_the_exercise(monkeypatch):
    monkeypatch.delenv("DOJO_NO_READING", raising=False)
    monkeypatch.setattr(reading, "load", lambda s: reading.parse(DOC, s))
    out = io.StringIO()
    opened = reading.button(
        "06_aggregates", "ex1", passed=False,
        console=Console(file=out, width=100), interactive=False,
    )
    text = out.getvalue()
    assert opened is False           # non-interactive: shown, not opened
    assert "READ: 06_aggregates/ex1" in text
    assert "dojo read 06_aggregates ex1" in text
    assert "Red." in text


def test_button_wording_differs_when_you_passed(monkeypatch):
    monkeypatch.delenv("DOJO_NO_READING", raising=False)
    monkeypatch.setattr(reading, "load", lambda s: reading.parse(DOC, s))
    out = io.StringIO()
    reading.button("06_aggregates", "ex1", passed=True,
                   console=Console(file=out, width=100), interactive=False)
    assert "Green." in out.getvalue()


def test_button_is_silenced_by_the_env_var(monkeypatch):
    monkeypatch.setenv("DOJO_NO_READING", "1")
    monkeypatch.setattr(reading, "load", lambda s: reading.parse(DOC, s))
    out = io.StringIO()
    assert reading.button("06_aggregates", "ex1", passed=True,
                          console=Console(file=out, width=100)) is False
    assert out.getvalue() == ""


def test_button_is_silent_when_the_lesson_has_no_reading(monkeypatch):
    monkeypatch.delenv("DOJO_NO_READING", raising=False)
    monkeypatch.setattr(reading, "load", lambda s: None)
    out = io.StringIO()
    assert reading.button("99_nope", "ex1", passed=True,
                          console=Console(file=out, width=100)) is False
    assert out.getvalue() == ""


def test_button_falls_back_to_the_lesson_when_the_section_is_missing(monkeypatch):
    monkeypatch.delenv("DOJO_NO_READING", raising=False)
    monkeypatch.setattr(reading, "load", lambda s: reading.parse(DOC, s))
    out = io.StringIO()
    reading.button("06_aggregates", "review1", passed=True,
                   console=Console(file=out, width=100), interactive=False)
    text = out.getvalue()
    assert "READ: 06_aggregates " in text
    assert "dojo read 06_aggregates" in text and "review1" not in text


# -- the lint --------------------------------------------------------------

@pytest.fixture()
def spec():
    return curriculum.LessonSpec("06_aggregates", ("ex1", "ex2"))


def _write(tmp_path, text):
    (tmp_path / "reading.md").write_text(text, encoding="utf-8")
    return tmp_path


def test_lint_accepts_a_complete_document(tmp_path, spec):
    assert verify.lint_reading(spec, _write(tmp_path, DOC)) == []


def test_lint_reports_a_missing_file(tmp_path, spec):
    assert verify.lint_reading(spec, tmp_path) == [
        "reading.md missing (theory notes + further reading)"
    ]


def test_lint_reports_a_missing_exercise_section(tmp_path, spec):
    doc = DOC.replace("## ex2 - FILTER scopes an aggregate", "## ex3 - stray")
    errors = verify.lint_reading(spec, _write(tmp_path, doc))
    assert "reading.md has no '## ex2' section" in errors
    assert "reading.md section '## ex3' has no manifest exercise" in errors


def test_lint_reports_too_few_links(tmp_path, spec):
    # split on the top-level heading only - ex1 has a "### Further reading" too
    doc = DOC.split("\n## Further reading")[0] + (
        "\n## Further reading\n\n"
        "- [one](https://www.postgresql.org/docs/16/functions-aggregate.html) - x.\n"
    )
    errors = verify.lint_reading(spec, _write(tmp_path, doc))
    assert any("has 1 link(s)" in e for e in errors)


def test_every_shipped_lesson_has_sound_reading():
    """Fast, database-free guard: `dojo verify` also checks this, but only
    after cloning a multi-gigabyte template per lesson."""
    from dojo.config import ROOT

    problems = {}
    for s in curriculum.all_lessons():
        ldir = ROOT / "lessons" / s.slug
        if not ldir.is_dir():
            continue  # not authored yet
        errors = verify.lint_reading(s, ldir)
        if errors:
            problems[s.slug] = errors
    assert not problems, "reading.md problems:\n" + "\n".join(
        f"  {slug}: {e}" for slug, errs in problems.items() for e in errs
    )


def test_lint_reports_a_stub_section(tmp_path, spec):
    doc = DOC.replace(
        "The dashboard row asks five questions of the same 500,000 rows, and the\n"
        "planner answers all five in a single scan.",
        "TODO",
    )
    errors = verify.lint_reading(spec, _write(tmp_path, doc))
    assert any("'## ex1' is only" in e for e in errors)
