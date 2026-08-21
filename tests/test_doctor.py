"""Unit tests for dojo.doctor's pure comparison logic (no DB needed)."""
from dojo import doctor
from dojo.doctor import FAIL, OK, WARN


def test_all_counts_match_is_ok():
    expected = {"customers": 100, "orders": 500}
    checks = doctor.evaluate_counts({"customers": 100, "orders": 500}, expected)
    assert all(c.status == OK for c in checks)
    assert doctor.worst(checks) == OK


def test_missing_table_fails():
    expected = {"customers": 100}
    checks = doctor.evaluate_counts({}, expected)
    assert checks[0].status == FAIL
    assert "missing" in checks[0].detail
    assert checks[0].fix  # offers a remediation command
    assert doctor.worst(checks) == FAIL


def test_empty_table_fails():
    checks = doctor.evaluate_counts({"orders": 0}, {"orders": 500})
    assert checks[0].status == FAIL
    assert "empty" in checks[0].detail


def test_different_count_warns_not_fails():
    # e.g. seeded with a different DOJO_SCALE: usable, but flagged.
    checks = doctor.evaluate_counts({"orders": 50}, {"orders": 500})
    assert checks[0].status == WARN
    assert doctor.worst(checks) == WARN


def test_worst_precedence():
    assert doctor.worst([
        doctor.Check("a", OK),
        doctor.Check("b", WARN),
        doctor.Check("c", FAIL),
    ]) == FAIL
    assert doctor.worst([doctor.Check("a", OK), doctor.Check("b", WARN)]) == WARN
    assert doctor.worst([doctor.Check("a", OK)]) == OK
    assert doctor.worst([]) == OK
