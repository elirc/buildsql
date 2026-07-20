from dojo.config import load_config


def test_defaults_present():
    cfg = load_config()
    assert cfg.host
    assert isinstance(cfg.port, int)
    assert cfg.template_db == "dojo_template"
    assert cfg.maintenance_db == "postgres"


def test_env_overrides(monkeypatch):
    monkeypatch.setenv("POSTGRES_HOST", "10.0.0.9")
    monkeypatch.setenv("POSTGRES_PORT", "6543")
    monkeypatch.setenv("DOJO_TEMPLATE_DB", "other_template")
    cfg = load_config()
    assert cfg.host == "10.0.0.9"
    assert cfg.port == 6543
    assert cfg.template_db == "other_template"
