"""`dojo doctor` - diagnose the local setup before you hit a wall.

Checks the things that block a first run, in the order they'd bite: config
loads, PostgreSQL is reachable, the template database exists, and it is fully
seeded. Prints a table of results with the exact command to fix each problem.

The row-count evaluation is factored into pure functions (`evaluate_counts`)
so it is unit-testable without a live database.
"""
from __future__ import annotations

from dataclasses import dataclass

from rich.console import Console
from rich.table import Table

OK, WARN, FAIL = "ok", "warn", "fail"

_STATUS_RENDER = {
    OK: "[green]ok[/green]",
    WARN: "[yellow]warn[/yellow]",
    FAIL: "[red]FAIL[/red]",
}


@dataclass
class Check:
    name: str
    status: str
    detail: str = ""
    fix: str = ""


def evaluate_counts(actual: dict[str, int | None], expected: dict[str, int]) -> list[Check]:
    """Compare seeded row counts against what a full seed should produce.

    - missing or empty table -> FAIL (seed never ran or did not finish)
    - present but a different count -> WARN (usually a different DOJO_SCALE)
    - exact match -> OK
    """
    checks: list[Check] = []
    for table, exp in expected.items():
        got = actual.get(table)
        if got is None:
            checks.append(Check(f"table {table}", FAIL, "missing", "uv run dojo seed"))
        elif got == 0:
            checks.append(Check(f"table {table}", FAIL, "empty - seed did not finish", "uv run dojo seed"))
        elif got != exp:
            checks.append(Check(
                f"table {table}", WARN,
                f"{got:,} rows (expected {exp:,}) - different DOJO_SCALE?",
            ))
        else:
            checks.append(Check(f"table {table}", OK, f"{got:,} rows"))
    return checks


def worst(checks: list[Check]) -> str:
    if any(c.status == FAIL for c in checks):
        return FAIL
    if any(c.status == WARN for c in checks):
        return WARN
    return OK


def _table_counts(conn, tables) -> dict[str, int | None]:
    counts: dict[str, int | None] = {}
    for t in tables:
        try:
            row = conn.execute(f"SELECT count(*) FROM {t}").fetchone()
            counts[t] = int(row[0]) if row else 0
        except Exception:
            counts[t] = None  # table absent
    return counts


def gather() -> list[Check]:
    """Run every check against the real environment, in dependency order."""
    from dojo import db, seed
    from dojo.config import load_config

    checks: list[Check] = []

    cfg = load_config()
    checks.append(Check("config", OK, f"{cfg.user}@{cfg.host}:{cfg.port}, template '{cfg.template_db}'"))

    # 1. Can we reach PostgreSQL at all?
    try:
        with db.connect(autocommit=True) as conn:
            ver = conn.execute("SHOW server_version").fetchone()[0]
        checks.append(Check("postgres reachable", OK, f"server {ver}"))
    except Exception as e:
        msg = str(e).splitlines()[0][:120]
        checks.append(Check(
            "postgres reachable", FAIL, msg,
            "uv run dojo up  (is Docker Desktop running?)",
        ))
        return checks  # nothing else can be checked

    # 2. Does the template exist?
    try:
        exists = db.database_exists(cfg.template_db)
    except Exception as e:
        checks.append(Check("template database", FAIL, str(e).splitlines()[0][:120], "uv run dojo seed"))
        return checks
    if not exists:
        checks.append(Check("template database", FAIL, f"'{cfg.template_db}' does not exist", "uv run dojo seed"))
        return checks
    checks.append(Check("template database", OK, f"'{cfg.template_db}' exists"))

    # 3. Is it fully seeded?
    expected = seed.row_counts()
    try:
        with db.connect(cfg.template_db, autocommit=True) as conn:
            actual = _table_counts(conn, expected.keys())
    except Exception as e:
        checks.append(Check("seed data", FAIL, str(e).splitlines()[0][:120], "uv run dojo seed"))
        return checks
    checks.extend(evaluate_counts(actual, expected))
    return checks


def _tool_version(exe: str, *args: str) -> str | None:
    """Run `exe --version` and hand back the first line, or None if absent."""
    import shutil
    import subprocess

    path = shutil.which(exe)
    if path is None:
        return None
    try:
        proc = subprocess.run([path, *(args or ("--version",))], capture_output=True,
                              text=True, encoding="utf-8", errors="replace", timeout=60)
    except (OSError, subprocess.SubprocessError):
        return None
    out = (proc.stdout or proc.stderr or "").strip().splitlines()
    return out[0] if out else ""


def gather_tracks(console: Console | None = None) -> list[Check]:
    """Toolchain checks for the non-SQL tracks. Never touches PostgreSQL.

    Deliberately separate from `gather()`: a stopped database must not hide
    the fact that your Node install is fine, or vice versa.
    """
    from dojo import runners, tracks

    checks: list[Check] = []

    node = _tool_version("node")
    if node is None:
        checks.append(Check("node", FAIL, "not on PATH",
                            "install Node 22 LTS from https://nodejs.org"))
    else:
        checks.append(Check("node", OK, node))

    npm = _tool_version("npm")
    if npm is None:
        checks.append(Check("npm", FAIL, "not on PATH", "install Node 22 LTS (npm ships with it)"))
    else:
        checks.append(Check("npm", OK, npm))

    js_track = tracks.get("typescript")
    vitest_cli = runners.VitestRunner(js_track).cli
    if vitest_cli.exists():
        checks.append(Check("tracks/node_modules", OK,
                            "installed - typescript, node and react can run"))
    else:
        checks.append(Check("tracks/node_modules", FAIL, "not installed",
                            "uv run dojo setup typescript"))

    sdk = _tool_version("dotnet")
    if sdk is None:
        checks.append(Check("dotnet sdk", FAIL, "not on PATH",
                            "install .NET 10 from https://dot.net"))
        return checks
    checks.append(Check("dotnet sdk", OK, f"SDK {sdk}"))

    import subprocess

    for name in ("csharp", "dotnet"):
        track = tracks.get(name)
        runner = runners.DotnetRunner(track)
        sln = runner.solution
        if not sln.is_file():
            checks.append(Check(f"{name} solution", FAIL, f"{sln.name} missing"))
            continue
        if console is not None:
            console.print(f"[dim]building {sln.name} ...[/dim]")
        proc = subprocess.run(
            [_which_dotnet(), "build", str(sln), "--nologo", "-v", "q"],
            cwd=str(track.root), capture_output=True, text=True,
            encoding="utf-8", errors="replace",
        )
        if proc.returncode == 0:
            checks.append(Check(f"{name} solution", OK, f"{sln.name} builds"))
        else:
            first = next((ln.strip() for ln in (proc.stdout or "").splitlines()
                          if ": error" in ln), "build failed")
            checks.append(Check(f"{name} solution", FAIL, first[:160],
                                f"uv run dojo setup {name}"))
    return checks


def _which_dotnet() -> str:
    import shutil

    return shutil.which("dotnet") or "dotnet"


def run() -> int:
    console = Console()
    checks = gather()
    checks.extend(gather_tracks(console))

    table = Table(title="dojo doctor")
    table.add_column("check")
    table.add_column("status")
    table.add_column("detail", overflow="fold")
    for c in checks:
        table.add_row(c.name, _STATUS_RENDER.get(c.status, c.status), c.detail)
    console.print(table)

    fixes = [c for c in checks if c.status == FAIL and c.fix]
    if fixes:
        console.print("\n[bold]To fix:[/bold]")
        for c in fixes:
            console.print(f"  [red]{c.name}[/red]: [bold]{c.fix}[/bold]")

    overall = worst(checks)
    if overall == OK:
        console.print("\n[green]All checks passed - you're ready. Run `uv run dojo next`.[/green]")
        return 0
    if overall == WARN:
        console.print("\n[yellow]Usable, with warnings above. `uv run dojo next` should work.[/yellow]")
        return 0
    console.print("\n[red]Setup is not ready. Fix the items above, then re-run `uv run dojo doctor`.[/red]")
    return 1
