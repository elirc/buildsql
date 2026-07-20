"""Root fixtures: template guard, per-lesson clones, progress hook."""
from __future__ import annotations

import pytest

from dojo import curriculum, db, progress
from dojo.config import load_config


@pytest.fixture(scope="session", autouse=True)
def template_ready():
    cfg = load_config()
    try:
        exists = db.database_exists(cfg.template_db)
    except Exception as e:  # connection refused, bad credentials, ...
        pytest.exit(f"Cannot reach PostgreSQL ({e}). Run: dojo up", returncode=1)
    if not exists:
        pytest.exit(f"Template '{cfg.template_db}' missing. Run: dojo seed", returncode=1)


def _slug_for(request) -> str:
    return request.node.path.parent.name


@pytest.fixture()
def lesson_db(request):
    """Fresh clone per test. Use for anything that executes DDL/DML/VACUUM."""
    clone = f"dojo_test_{_slug_for(request)}"
    db.clone_template(clone)
    conn = db.connect(clone)
    try:
        yield conn
    finally:
        conn.close()
        db.drop_database(clone)


@pytest.fixture(scope="module")
def shared_lesson_db(request):
    """One clone per lesson module, autocommit so one exercise's syntax error
    can't poison the next with InFailedSqlTransaction. Read-only lessons only."""
    clone = f"dojo_test_{_slug_for(request)}"
    db.clone_template(clone)
    conn = db.connect(clone, autocommit=True)
    try:
        yield conn
    finally:
        conn.close()
        db.drop_database(clone)


def pytest_runtest_logreport(report):
    if report.when != "call":
        return
    parts = report.nodeid.split("::")
    if len(parts) != 2 or not parts[0].startswith("lessons/"):
        return
    path, test_name = parts
    slug = path.split("/")[1]
    exercise_id = f"{slug}::{test_name}"
    is_review = "review" in report.keywords
    is_challenge = "challenge" in report.keywords
    progress.record_outcome(exercise_id, report.passed, is_review)

    # When all core exercises of a Part 1-2 lesson first pass, schedule its review.
    if report.passed and not is_review and not is_challenge:
        spec = curriculum.lesson(slug)
        if spec and spec.review:
            data = progress.load()
            if all(progress.passed(data, eid) for eid in spec.core_ids()):
                progress.schedule_review(spec.exercise_id("review1"))
