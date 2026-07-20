"""Fixtures for harness unit tests."""
from __future__ import annotations

import pytest
from psycopg import sql

from dojo import db


@pytest.fixture()
def scratch_db():
    """A fresh EMPTY database (not a template clone) for catalog tests."""
    name = "dojo_scratch_tests"
    db.drop_database(name)
    with db.connect(autocommit=True) as conn:
        conn.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(name)))
    conn = db.connect(name)
    try:
        yield conn
    finally:
        conn.close()
        db.drop_database(name)


CANNED_PLAN = {
    "Plan": {
        "Node Type": "Sort",
        "Actual Rows": 42,
        "Actual Loops": 1,
        "Actual Total Time": 250.0,
        "Plans": [
            {
                "Node Type": "Hash Join",
                "Actual Rows": 42,
                "Actual Loops": 1,
                "Actual Total Time": 240.0,
                "Plans": [
                    {
                        "Node Type": "Seq Scan",
                        "Relation Name": "orders",
                        "Actual Rows": 500000,
                        "Actual Loops": 1,
                        "Actual Total Time": 210.0,
                    },
                    {
                        "Node Type": "Hash",
                        "Actual Rows": 50000,
                        "Actual Loops": 1,
                        "Actual Total Time": 20.0,
                        "Plans": [
                            {
                                "Node Type": "Index Scan",
                                "Index Name": "customers_pkey",
                                "Relation Name": "customers",
                                "Actual Rows": 50000,
                                "Actual Loops": 1,
                                "Actual Total Time": 15.0,
                            }
                        ],
                    },
                ],
            }
        ],
    },
    "Planning Time": 0.5,
    "Execution Time": 251.0,
}


@pytest.fixture()
def canned_plan():
    import copy

    return copy.deepcopy(CANNED_PLAN)


@pytest.fixture(scope="module")
def template_conn():
    from dojo.config import load_config

    cfg = load_config()
    conn = db.connect(cfg.template_db)
    try:
        yield conn
    finally:
        conn.close()
