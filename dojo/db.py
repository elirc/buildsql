"""Connections and template-database cloning."""
from __future__ import annotations

import psycopg
from psycopg import sql

from dojo.config import load_config


def connect(dbname: str | None = None, autocommit: bool = False) -> psycopg.Connection:
    cfg = load_config()
    return psycopg.connect(
        host=cfg.host,
        port=cfg.port,
        user=cfg.user,
        password=cfg.password,
        dbname=dbname or cfg.maintenance_db,
        autocommit=autocommit,
    )


def database_exists(name: str) -> bool:
    with connect(autocommit=True) as conn:
        row = conn.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s", (name,)
        ).fetchone()
        return row is not None


def clone_template(clone_name: str) -> None:
    """Drop clone_name if it exists, then create it fresh from the template."""
    cfg = load_config()
    with connect(autocommit=True) as conn:
        conn.execute(
            sql.SQL("DROP DATABASE IF EXISTS {} WITH (FORCE)").format(
                sql.Identifier(clone_name)
            )
        )
        conn.execute(
            sql.SQL("CREATE DATABASE {} TEMPLATE {}").format(
                sql.Identifier(clone_name), sql.Identifier(cfg.template_db)
            )
        )


def drop_database(name: str) -> None:
    with connect(autocommit=True) as conn:
        conn.execute(
            sql.SQL("DROP DATABASE IF EXISTS {} WITH (FORCE)").format(
                sql.Identifier(name)
            )
        )


def list_databases(prefix: str) -> list[str]:
    with connect(autocommit=True) as conn:
        rows = conn.execute(
            "SELECT datname FROM pg_database WHERE datname LIKE %s ORDER BY datname",
            (prefix + "%",),
        ).fetchall()
        return [r[0] for r in rows]
