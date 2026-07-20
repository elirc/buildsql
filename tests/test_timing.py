import json

import pytest

from dojo import timing


@pytest.fixture()
def baseline_file(tmp_path, monkeypatch):
    path = tmp_path / "baseline.json"
    monkeypatch.setattr(timing, "BASELINE_PATH", path)
    return path


def test_measure_returns_positive(template_conn):
    ms = timing.measure_execution_ms(template_conn, "SELECT 1", repeats=2, warmup=1)
    assert ms >= 0


def test_cached_baseline_caches(baseline_file, template_conn):
    v1 = timing.cached_baseline(template_conn, "x::test", "SELECT 1", repeats=1)
    saved = json.loads(baseline_file.read_text())
    assert saved["x::test"] == v1
    # second call must come from the cache, not a new measurement
    saved["x::test"] = 12345.0
    baseline_file.write_text(json.dumps(saved))
    assert timing.cached_baseline(template_conn, "x::test", "SELECT 1") == 12345.0


def test_corrupt_baseline_file_is_ignored(baseline_file, template_conn):
    baseline_file.write_text("{not json")
    v = timing.cached_baseline(template_conn, "y::test", "SELECT 1", repeats=1)
    assert v >= 0
    assert "y::test" in json.loads(baseline_file.read_text())


def test_reset_baselines(baseline_file):
    baseline_file.write_text("{}")
    assert timing.reset_baselines() is True
    assert not baseline_file.exists()
    assert timing.reset_baselines() is False
