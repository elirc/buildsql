"""pg_catalog assertions for schema-design gates (Part 4)."""
from __future__ import annotations

import psycopg


def _columns(conn, table: str) -> dict[str, str]:
    rows = conn.execute(
        """
        SELECT a.attname, format_type(a.atttypid, a.atttypmod)
        FROM pg_attribute a
        JOIN pg_class c ON a.attrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public' AND c.relname = %s
          AND a.attnum > 0 AND NOT a.attisdropped
        ORDER BY a.attnum
        """,
        (table,),
    ).fetchall()
    return {name: typ for name, typ in rows}


def _table_exists(conn, table: str) -> bool:
    return (
        conn.execute(
            "SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid "
            "WHERE n.nspname = 'public' AND c.relname = %s AND c.relkind IN ('r','p')",
            (table,),
        ).fetchone()
        is not None
    )


def assert_table(conn, name: str, columns: dict[str, str] | None = None) -> None:
    if not _table_exists(conn, name):
        raise AssertionError(
            f"MISSING TABLE: expected a table named '{name}' but it doesn't exist.\n"
            "  Did your CREATE TABLE run? Check the exact spelling in the prompt."
        )
    if columns:
        actual = _columns(conn, name)
        for col, type_prefix in columns.items():
            if col not in actual:
                raise AssertionError(
                    f"MISSING COLUMN: table '{name}' has no column '{col}'.\n"
                    f"  Columns it does have: {', '.join(actual) or '(none)'}"
                )
            if not actual[col].startswith(type_prefix):
                raise AssertionError(
                    f"WRONG TYPE: column '{name}.{col}' is '{actual[col]}', "
                    f"expected a type starting with '{type_prefix}'.\n"
                    "  Reread the lesson's type-choice guidance."
                )


def assert_not_null(conn, table: str, column: str) -> None:
    row = conn.execute(
        """
        SELECT a.attnotnull FROM pg_attribute a
        JOIN pg_class c ON a.attrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public' AND c.relname = %s AND a.attname = %s
        """,
        (table, column),
    ).fetchone()
    if row is None:
        raise AssertionError(f"MISSING COLUMN: '{table}.{column}' does not exist.")
    if not row[0]:
        raise AssertionError(
            f"NULLABLE COLUMN: '{table}.{column}' allows NULLs but should be NOT NULL.\n"
            "  A missing value here would silently corrupt downstream queries."
        )


def _constraint_columns(conn, table: str, contype: str) -> list[list[str]]:
    rows = conn.execute(
        """
        SELECT (SELECT array_agg(a.attname ORDER BY x.ord)
                FROM unnest(con.conkey) WITH ORDINALITY AS x(attnum, ord)
                JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = x.attnum)
        FROM pg_constraint con
        JOIN pg_class c ON con.conrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public' AND c.relname = %s AND con.contype = %s
        """,
        (table, contype),
    ).fetchall()
    return [r[0] for r in rows if r[0]]


def assert_pk(conn, table: str, columns: list[str]) -> None:
    pks = _constraint_columns(conn, table, "p")
    if not pks:
        raise AssertionError(
            f"NO PRIMARY KEY: table '{table}' has no primary key at all.\n"
            "  Every table in this course gets one - without it, rows have no identity."
        )
    if sorted(pks[0]) != sorted(columns):
        raise AssertionError(
            f"WRONG PRIMARY KEY: '{table}' has PRIMARY KEY ({', '.join(pks[0])}), "
            f"expected ({', '.join(columns)})."
        )


def assert_unique(conn, table: str, columns: list[str]) -> None:
    # accept either a UNIQUE constraint or a plain unique index
    rows = conn.execute(
        """
        SELECT (SELECT array_agg(a.attname ORDER BY x.ord)
                FROM unnest(i.indkey) WITH ORDINALITY AS x(attnum, ord)
                JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = x.attnum)
        FROM pg_index i
        JOIN pg_class c ON i.indrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public' AND c.relname = %s AND i.indisunique
        """,
        (table,),
    ).fetchall()
    for (cols,) in rows:
        if cols and sorted(cols) == sorted(columns):
            return
    raise AssertionError(
        f"MISSING UNIQUE: no UNIQUE constraint/index on {table}({', '.join(columns)}).\n"
        "  Without it, duplicate rows can creep in and ON CONFLICT has nothing to target."
    )


def assert_check(conn, table: str, must_mention: str) -> None:
    rows = conn.execute(
        """
        SELECT pg_get_constraintdef(con.oid)
        FROM pg_constraint con
        JOIN pg_class c ON con.conrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public' AND c.relname = %s AND con.contype = 'c'
        """,
        (table,),
    ).fetchall()
    for (definition,) in rows:
        if must_mention.lower() in definition.lower():
            return
    raise AssertionError(
        f"MISSING CHECK: table '{table}' has no CHECK constraint mentioning "
        f"'{must_mention}'.\n"
        f"  CHECK constraints found: {[r[0] for r in rows] or '(none)'}"
    )


_DELTYPE = {"a": "NO ACTION", "c": "CASCADE", "n": "SET NULL", "r": "RESTRICT", "d": "SET DEFAULT"}


def assert_fk(
    conn, table: str, columns: list[str], ref_table: str, on_delete: str | None = None
) -> None:
    rows = conn.execute(
        """
        SELECT (SELECT array_agg(a.attname ORDER BY x.ord)
                FROM unnest(con.conkey) WITH ORDINALITY AS x(attnum, ord)
                JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = x.attnum),
               ref.relname, con.confdeltype
        FROM pg_constraint con
        JOIN pg_class c ON con.conrelid = c.oid
        JOIN pg_class ref ON con.confrelid = ref.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public' AND c.relname = %s AND con.contype = 'f'
        """,
        (table,),
    ).fetchall()
    for cols, refname, deltype in rows:
        if cols and sorted(cols) == sorted(columns) and refname == ref_table:
            if on_delete and _DELTYPE.get(deltype) != on_delete.upper():
                raise AssertionError(
                    f"WRONG ON DELETE: FK {table}({', '.join(columns)}) -> {ref_table} "
                    f"is ON DELETE {_DELTYPE.get(deltype)}, expected ON DELETE {on_delete.upper()}."
                )
            return
    found = [f"({', '.join(c)}) -> {r}" for c, r, _ in rows if c]
    raise AssertionError(
        f"MISSING FOREIGN KEY: no FK from {table}({', '.join(columns)}) to {ref_table}.\n"
        f"  FKs found on '{table}': {found or '(none)'}\n"
        "  Without the FK, orphan rows are legal and joins silently lose data integrity."
    )


def assert_view(conn, name: str) -> None:
    row = conn.execute(
        "SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = %s",
        (name,),
    ).fetchone()
    if row is None:
        raise AssertionError(
            f"MISSING VIEW: expected a view named '{name}' but it doesn't exist.\n"
            "  CREATE VIEW gives a query a name - check the exact name in the prompt."
        )


def assert_index(conn, table: str, columns_prefix: list[str]) -> None:
    rows = conn.execute(
        """
        SELECT ic.relname,
               (SELECT array_agg(a.attname ORDER BY x.ord)
                FROM unnest(i.indkey) WITH ORDINALITY AS x(attnum, ord)
                JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = x.attnum
                WHERE x.attnum > 0)
        FROM pg_index i
        JOIN pg_class c ON i.indrelid = c.oid
        JOIN pg_class ic ON i.indexrelid = ic.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public' AND c.relname = %s
        """,
        (table,),
    ).fetchall()
    k = len(columns_prefix)
    for _, cols in rows:
        if cols and list(cols[:k]) == list(columns_prefix):
            return
    found = [f"{name} ({', '.join(cols or [])})" for name, cols in rows]
    raise AssertionError(
        f"MISSING INDEX: no index on '{table}' whose leading columns are "
        f"({', '.join(columns_prefix)}).\n"
        f"  Indexes found: {found or '(none)'}\n"
        "  Remember: only the LEADING columns of an index are usable for a lookup."
    )


# -- behavioral probes ---------------------------------------------------

def rejects(conn, dml_sql: str, why: str = "") -> None:
    """Assert that a probe statement FAILS under the learner's constraints.

    The probe runs inside a savepoint and is always rolled back, so it never
    leaves state behind either way.
    """
    conn.execute("SAVEPOINT probe")
    try:
        conn.execute(dml_sql)
    except psycopg.Error:
        conn.execute("ROLLBACK TO SAVEPOINT probe")
        return
    conn.execute("ROLLBACK TO SAVEPOINT probe")
    raise AssertionError(
        "CONSTRAINT DID NOT BITE: this statement should have been REJECTED, "
        "but the database accepted it:\n"
        f"    {dml_sql.strip()}\n"
        + (f"  Why it must fail: {why}\n" if why else "")
        + "  A constraint that exists but doesn't reject bad data isn't doing its job."
    )


def accepts(conn, dml_sql: str, why: str = "") -> None:
    """Assert that a probe statement SUCCEEDS (then roll it back)."""
    conn.execute("SAVEPOINT probe")
    try:
        conn.execute(dml_sql)
    except psycopg.Error as e:
        conn.execute("ROLLBACK TO SAVEPOINT probe")
        raise AssertionError(
            "TOO STRICT: this perfectly valid statement was rejected:\n"
            f"    {dml_sql.strip()}\n"
            f"  Database said: {e}\n"
            + (f"  Why it must succeed: {why}" if why else "")
        ) from None
    conn.execute("ROLLBACK TO SAVEPOINT probe")
