from datetime import date

import pytest

from dojo import progress


@pytest.fixture(autouse=True)
def progress_file(tmp_path, monkeypatch):
    path = tmp_path / "progress.json"
    monkeypatch.setattr(progress, "PROGRESS_PATH", path)
    monkeypatch.delenv("DOJO_NO_PROGRESS", raising=False)
    return path


def test_missing_file_is_empty():
    data = progress.load()
    assert data == {"exercises": {}, "reviews": {}}


def test_corrupt_file_is_empty(progress_file):
    progress_file.write_text("]]]not json")
    data = progress.load()
    assert data["exercises"] == {}


def test_record_attempt_and_pass():
    progress.record_outcome("01_x::test_ex1", passed=False, is_review=False)
    progress.record_outcome("01_x::test_ex1", passed=True, is_review=False)
    data = progress.load()
    ex = data["exercises"]["01_x::test_ex1"]
    assert ex["attempts"] == 2
    assert ex["passed_at"]
    assert progress.passed(data, "01_x::test_ex1")


def test_hints_recorded():
    progress.record_hint("01_x::test_ex1", 1)
    progress.record_hint("01_x::test_ex1", 2)
    progress.record_hint("01_x::test_ex1", 1)  # never decreases
    assert progress.load()["exercises"]["01_x::test_ex1"]["hints_used"] == 2


def test_no_progress_env(monkeypatch, progress_file):
    monkeypatch.setenv("DOJO_NO_PROGRESS", "1")
    progress.record_outcome("01_x::test_ex1", passed=True, is_review=False)
    progress.record_hint("01_x::test_ex1", 1)
    progress.schedule_review("01_x::test_review1")
    assert not progress_file.exists()


def test_review_ladder():
    today = date(2026, 7, 20)
    progress.schedule_review("01_x::test_review1", today=today)
    data = progress.load()
    assert data["reviews"]["01_x::test_review1"]["due"] == "2026-07-23"

    # pass on the due date -> next interval (7 days)
    d1 = date(2026, 7, 23)
    progress.record_outcome("01_x::test_review1", passed=True, is_review=True, today=d1)
    rev = progress.load()["reviews"]["01_x::test_review1"]
    assert rev["interval_index"] == 1
    assert rev["due"] == "2026-07-30"

    # pass again -> 21 days
    d2 = date(2026, 7, 30)
    progress.record_outcome("01_x::test_review1", passed=True, is_review=True, today=d2)
    rev = progress.load()["reviews"]["01_x::test_review1"]
    assert rev["interval_index"] == 2
    assert rev["due"] == "2026-08-20"

    # fail -> reset to start of ladder
    d3 = date(2026, 8, 20)
    progress.record_outcome("01_x::test_review1", passed=False, is_review=True, today=d3)
    rev = progress.load()["reviews"]["01_x::test_review1"]
    assert rev["interval_index"] == 0
    assert rev["due"] == "2026-08-23"
    assert len(rev["history"]) == 3


def test_schedule_review_never_resets_existing():
    progress.schedule_review("01_x::test_review1", today=date(2026, 7, 20))
    progress.record_outcome("01_x::test_review1", passed=True, is_review=True,
                            today=date(2026, 7, 23))
    progress.schedule_review("01_x::test_review1", today=date(2026, 8, 1))
    rev = progress.load()["reviews"]["01_x::test_review1"]
    assert rev["interval_index"] == 1  # untouched


def test_reviews_due():
    progress.schedule_review("01_x::test_review1", today=date(2026, 7, 20))  # due 07-23
    progress.schedule_review("02_y::test_review1", today=date(2026, 7, 25))  # due 07-28
    due = progress.reviews_due(today=date(2026, 7, 24))
    assert due == ["01_x::test_review1"]
    assert progress.reviews_due(today=date(2026, 7, 28)) == [
        "01_x::test_review1", "02_y::test_review1"
    ]
