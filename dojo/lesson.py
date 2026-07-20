"""Lesson/Exercise file-loading helpers."""
from __future__ import annotations

from pathlib import Path

import psycopg


def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return ""


class Exercise:
    def __init__(self, dir: Path):
        self.dir = Path(dir)
        self.name = self.dir.name

    @property
    def solution_sql(self) -> str:
        return _read(self.dir / "solution.sql")

    @property
    def expected_sql(self) -> str:
        return _read(self.dir / "expected.sql")

    @property
    def indexes_sql(self) -> str:
        return _read(self.dir / "indexes.sql")

    @property
    def hints_path(self) -> Path:
        return self.dir / "hints.md"

    @property
    def reference_dir(self) -> Path:
        return self.dir / ".reference"

    def apply_indexes(self, conn) -> None:
        sql = self.indexes_sql.strip()
        if sql:
            conn.execute(sql)
            if not conn.autocommit:
                conn.commit()

    def fetch(self, conn, sql: str) -> list[tuple]:
        """Run a query and return rows of its last result set."""
        cur = conn.execute(sql)
        rows: list[tuple] = cur.fetchall() if cur.description else []
        try:
            while cur.nextset():
                if cur.description:
                    rows = cur.fetchall()
        except psycopg.ProgrammingError:
            pass
        return rows


class Lesson:
    def __init__(self, test_file_path: str | Path):
        self.dir = Path(test_file_path).resolve().parent
        self.slug = self.dir.name

    @property
    def setup_sql(self) -> str:
        return _read(self.dir / "setup.sql")

    def apply_setup(self, conn) -> None:
        sql = self.setup_sql.strip()
        if sql:
            conn.execute(sql)
            if not conn.autocommit:
                conn.commit()

    def exercise(self, name: str) -> Exercise:
        return Exercise(self.dir / name)
