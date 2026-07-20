# SQL Dojo — Full Build Specification

**A self-directed, pytest-graded PostgreSQL course: from first SELECT to query-plan tuning.**

This document is a complete, self-contained build spec. You (the implementing LLM/agent) should be able to build the entire project from this document alone, without access to any prior codebase. Follow the milestones in §14 in order. Do not skip the verification requirements in §13.

---

## 1. Overview and goals

SQL Dojo is a local, self-study SQL course for one learner (Eli). Every lesson is a directory containing teaching prose (`README.md`) and one or more **exercises**. The learner writes real SQL in stub files against a real PostgreSQL 16 database seeded with a realistic multi-million-row e-commerce dataset, then runs an automated gate (pytest) that grades the work and produces **teaching-oriented failure messages**. The learner is a beginner: the course starts at "what is SELECT" and ramps, over 48 lessons, through intermediate querying (windows, CTEs), data modification, schema design, and finally PostgreSQL performance and indexing internals.

Design philosophy (in priority order):

1. **The learner writes every line of SQL themselves.** The system never auto-completes or auto-fixes. Grading is automated; solving is human.
2. **Failure messages teach.** A failed gate should tell the learner *what* is wrong, *show* the evidence (row diff, plan shape, timing numbers), and *point* at the concept to reread — never just `AssertionError`.
3. **Isolation by cloning.** Every graded run happens against a fresh, throwaway clone of a seeded template database. Nothing one lesson does (indexes, bloat, dropped tables) can leak into another.
4. **Everything is deterministic and offline.** Fixed RNG seeds, fixed timestamps, no network calls at exercise time. The learner's machine is the whole system.
5. **Practice volume and retention are first-class.** Unlike v1 (a single exercise per lesson), every lesson has multiple graded exercises plus a challenge tier; a hints system lets the learner get unstuck without spoiling; a lightweight spaced-review scheduler brings old topics back.

### 1.1 Prior art

This project is an improved second version of `adammfrank/sql-practice` ("SQL Performance Dojo"), which covered only the performance/indexing curriculum (Part 5 here). Keep what worked there:

- Template-database cloning per test (`CREATE DATABASE … TEMPLATE …`).
- Three-stage gate for performance lessons: correctness (row match) → plan shape (EXPLAIN JSON assertions) → speed (vs. a per-machine cached baseline in `data/baseline.json`).
- Teaching-oriented assertion messages in a small `grader` module.
- Lesson READMEs with the structure: *the problem → what to do → run it → the gate (shown verbatim) → the teaching point*.
- `make lab` (persistent psql sandbox clone) and `make plan` (print EXPLAIN for your current solution, no gate).
- Best-of-N `EXPLAIN ANALYZE` timing with warmup; speed gates skipped below a floor (2 ms) to avoid noise-flakiness.
- Per-machine baseline calibration cached in `data/baseline.json` (delete file to recalibrate).
- `POSTGRES_HOST=127.0.0.1` default (avoids IPv6 `localhost` hang on some systems).

New in this version:

- Full beginner-to-advanced curriculum (Parts 0–6, §11), not just performance.
- 2–4 graded exercises per lesson + 1 optional challenge exercise, instead of one.
- Tiered hints per exercise, revealed progressively via the CLI (§8).
- Progress tracking (`data/progress.json`), a status dashboard, and `dojo next` (§9).
- Spaced review: review-variant exercises scheduled at growing intervals (§9.3).
- New gate families: schema/catalog gates and data-modification gates (§7).
- A `dojo` CLI as the primary interface (Makefile kept as thin wrappers) (§10).
- Author-side verification: `dojo verify` proves every exercise is solvable by running hidden reference solutions through the real gates (§13).

---

## 2. Tech stack and environment

- **PostgreSQL 16** in Docker (docker compose, named volume, healthcheck via `pg_isready`).
- **Python 3.11+**, managed with **uv**. Package name `dojo`, project name `sql-dojo`.
- Dependencies: `psycopg[binary]>=3.1`, `faker>=24.0`, `python-dotenv>=1.0`, `rich>=13` (CLI rendering). Dev extra: `pytest>=8.0`.
- No ORM. Raw SQL via psycopg everywhere.
- Entry point: `[project.scripts] dojo = "dojo.cli:main"` so the learner runs `uv run dojo <command>`.

`.env.example` (copied to `.env` by the learner):

```
POSTGRES_HOST=127.0.0.1        # not "localhost" — avoids IPv6 hang on Windows/Docker Desktop
POSTGRES_PORT=5432
POSTGRES_USER=dojo
POSTGRES_PASSWORD=dojo
POSTGRES_MAINTENANCE_DB=postgres
DOJO_TEMPLATE_DB=dojo_template
```

`docker-compose.yml`: single `db` service, `postgres:16`, environment `POSTGRES_USER: dojo`, `POSTGRES_PASSWORD: dojo`, `POSTGRES_DB: postgres` (the image won't start without a password, and the healthcheck's `dojo` user only exists because of `POSTGRES_USER`), ports `${POSTGRES_PORT:-5432}:5432`, named volume `dojo_pgdata`, healthcheck `pg_isready -U dojo` (5s interval, 3s timeout, 10 retries).

pytest config in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
testpaths = ["tests", "lessons"]
python_files = ["test_*.py", "test_lesson.py"]
addopts = "-ra --import-mode=importlib"
markers = [
  "challenge: optional harder exercise, excluded from core progress",
  "review: spaced-review variant, run via `dojo review`",
]
```

---

## 3. Repository layout

```
sql-dojo/
├── README.md                  # learner-facing: setup, gameplay loop, curriculum map
├── BUILD_SPEC.md              # this document (checked in for reference)
├── pyproject.toml
├── uv.lock
├── .env.example
├── .gitignore                 # .env, data/*.json, __pycache__, .venv
├── docker-compose.yml
├── Makefile                   # thin wrappers around `uv run dojo …`
├── conftest.py                # fixtures: template guard, lesson_db clones, progress hook
├── dojo/                      # the harness package
│   ├── __init__.py
│   ├── config.py              # env loading -> Config dataclass
│   ├── db.py                  # connect(), clone_template(), drop_database()
│   ├── schema.sql             # template DDL
│   ├── seed.py                # deterministic data generator -> dojo_template
│   ├── facts.py               # computes docs/dataset_facts.md from seeded template
│   ├── lesson.py              # Lesson/Exercise file-loading helpers
│   ├── plan.py                # EXPLAIN JSON wrapper (Plan class)
│   ├── timing.py              # best-of-N timing + baseline cache
│   ├── grader.py              # row/plan/speed assertions with teaching messages
│   ├── catalog.py             # pg_catalog assertions for schema-design gates
│   ├── progress.py            # progress.json read/write, review scheduling
│   ├── lab.py                 # persistent sandbox clones
│   ├── plan_lesson.py         # `dojo plan` implementation
│   ├── verify.py              # `dojo verify` — run reference solutions through gates
│   ├── curriculum.py          # checked-in manifest: parts -> lesson slugs -> exercise names
│   └── cli.py                 # argparse CLI dispatching to the above
├── tests/                     # harness unit tests (not lessons)
│   ├── test_config.py
│   ├── test_plan.py
│   ├── test_grader.py
│   ├── test_catalog.py
│   ├── test_timing.py
│   ├── test_progress.py
│   ├── test_lesson_loader.py
│   └── test_smoke.py          # end-to-end: clone, run a trivial gate
├── data/                      # gitignored runtime state
│   ├── .gitkeep
│   ├── baseline.json          # per-machine speed baselines (created lazily)
│   └── progress.json          # pass/attempt/hint/review state (created lazily)
├── docs/
│   ├── dataset.md             # schema diagram + column semantics (hand-written)
│   └── dataset_facts.md       # generated by `dojo seed`: counts, distributions
└── lessons/
    └── NN_slug/               # e.g. 08_inner_joins
        ├── README.md          # teaching prose + every exercise prompt
        ├── test_lesson.py     # one test function per exercise
        ├── ex1/
        │   ├── solution.sql   # student stub (starts as `-- your query here\nSELECT 1;`)
        │   ├── expected.sql   # reference query producing the expected rows
        │   ├── hints.md       # ## Hint 1 / ## Hint 2 / ## Hint 3 sections
        │   └── .reference/    # author-only files for `dojo verify`
        │       └── solution.sql
        ├── ex2/ …
        ├── challenge/ …       # same shape; test marked @pytest.mark.challenge
        ├── review1/ …         # same shape; test marked @pytest.mark.review
        ├── indexes.sql        # ONLY in Part 5 lessons (per-exercise where needed)
        └── setup.sql          # optional scenario DDL/DML applied before the gate
```

Notes:

- Exercise IDs used in progress tracking are `"<lesson_slug>::<test_name>"`, e.g. `08_inner_joins::test_ex2`.
- In Part 5 (performance), exercises that require DDL get their own `indexes.sql` inside the exercise dir (e.g. `ex1/indexes.sql`); the stub is an empty file with a comment header.
- `.reference/` contents mirror whatever the student edits for that exercise (`solution.sql`, and `indexes.sql` where applicable). They are the author's known-good answers, used only by `dojo verify` — never imported by the graded tests.
- `expected.sql` exists only for correctness-gated exercises. For performance exercises it doubles as the **naive baseline query** (correct rows, no index assumptions). For gates that assert state rather than rows (schema/DML/operational), there is no `expected.sql`; the test asserts directly.

---

## 4. The dataset

One template database, `dojo_template`, seeded once. It must be rich enough to serve beginner SELECTs and 8x-speedup index lessons alike.

### 4.1 Schema (`dojo/schema.sql`)

```sql
CREATE TABLE customers (
  id          int PRIMARY KEY,
  name        text NOT NULL,
  email       text NOT NULL,
  country     text NOT NULL,           -- ISO 3166-1 alpha-2
  created_at  timestamptz NOT NULL
);

CREATE TABLE products (
  id          int PRIMARY KEY,
  name        text NOT NULL,
  category    text NOT NULL,
  price       numeric(10,2) NOT NULL,
  description text NOT NULL,
  attributes  jsonb NOT NULL           -- {"color": …, "size": …, "tags": […]}
);

CREATE TABLE orders (
  id          int PRIMARY KEY,
  customer_id int NOT NULL REFERENCES customers(id),
  status      text NOT NULL,           -- pending | paid | shipped | cancelled
  total       numeric(10,2) NOT NULL,
  created_at  timestamptz NOT NULL
);

CREATE TABLE order_items (
  id          int PRIMARY KEY,
  order_id    int NOT NULL REFERENCES orders(id),
  product_id  int NOT NULL REFERENCES products(id),
  quantity    int NOT NULL,
  price       numeric(10,2) NOT NULL
);

CREATE TABLE reviews (
  id          int PRIMARY KEY,
  product_id  int NOT NULL REFERENCES products(id),
  rating      int NOT NULL,            -- 1..5
  body        text NOT NULL,
  created_at  timestamptz NOT NULL
);

CREATE TABLE events (
  id          bigint PRIMARY KEY,
  customer_id int NOT NULL,
  event_type  text NOT NULL,           -- view | click | add_to_cart | purchase | logout
  payload     jsonb NOT NULL,
  ts          timestamptz NOT NULL     -- strictly increasing with id (ideal for BRIN)
);

CREATE TABLE staff (                   -- NEW vs v1: enables self-joins, hierarchies,
  id          int PRIMARY KEY,         -- window functions over salaries, etc.
  name        text NOT NULL,
  department  text NOT NULL,           -- sales | support | engineering | ops | finance
  manager_id  int REFERENCES staff(id),-- NULL for the CEO; forest depth 3-4
  salary      numeric(10,2) NOT NULL,
  hired_on    date NOT NULL
);
```

**No indexes beyond primary keys in the template.** Learners create every secondary index themselves in Part 5. (FK columns are deliberately unindexed — this becomes a teaching point.)

### 4.2 Volumes and generation rules (`dojo/seed.py`)

| table       | rows       | notes |
|-------------|-----------:|-------|
| customers   | 50,000     | `email = 'user{id}@example.com'`; Faker names; country codes; created_at spread over ~2 years |
| products    | 10,000     | 6 categories: books, electronics, garden, toys, clothing, food; price 1–500; jsonb attributes with color (5 values), size (s/m/l/xl), 2 tags |
| orders      | 500,000    | uniform random customer_id; status weighted (`pending, paid, paid, paid, shipped, cancelled`); total 5–2000; created_at spread over ~1 year |
| order_items | 1,000,000  | uniform random order_id / product_id; quantity 1–5 |
| reviews     | 1,000,000  | uniform product_id; rating 1–5; Faker paragraph body |
| events      | 3,000,000  | `ts` strictly increasing with id (`base_epoch - N + i` seconds); payload `{"path": "/p/<pid>", "value": 0..1000}` |
| staff       | 500        | 5 departments; a single root (CEO) with `manager_id NULL`; managers assigned so tree depth is 3–4; salaries 40k–250k correlated with depth; hired_on spread over 10 years |

Rules:

- `random.Random(1234)` and `Faker.seed(1234)` — the dataset is identical on every machine.
- Timestamps derive from a fixed epoch base (`1_700_000_000`), never `now()`.
- Bulk load via `COPY … FROM STDIN` with psycopg's `cursor.copy()`, printing per-table row counts and elapsed time.
- Seeding drops and recreates `dojo_template` from the maintenance DB, applies `schema.sql`, generates data, then runs `VACUUM ANALYZE` (on an autocommit connection — VACUUM can't run in a transaction) so the template ships with fresh statistics **and a populated visibility map** (clones inherit it; without this, index-only scans in lesson 34 degrade to heap fetches). Target: under ~3 minutes on a laptop.
- Support a `DOJO_SCALE` env var (float, default 1.0) multiplying all row counts — used by CI to seed a small template quickly (§13). Speed gates naturally skip at small scale via the 2 ms floor.
- After seeding, call `dojo.facts.write_facts()`: it runs a fixed set of aggregate queries against the fresh template and writes `docs/dataset_facts.md` (row counts, orders-per-status counts, min/max timestamps, orders for customer 4242, staff tree depth, etc.). Lesson authors rely on these facts in prose; regenerating keeps prose honest.

*(Implementation note: the shipped seeder draws `orders.customer_id` uniformly from the first ~90% of customers and `order_items.product_id` from the first ~97% of products, so "customers with zero orders" and "products never ordered" exist in teaching-useful quantities for the outer-join lessons.)*

### 4.3 `docs/dataset.md`

Hand-written schema tour for the learner: each table's purpose, column semantics, and how tables relate (FK diagram in a Mermaid block). Lessons link here instead of re-explaining the schema every time.

---

## 5. Harness core

### 5.1 `dojo/config.py`

`load_config() -> Config` dataclass: host, port, user, password, `maintenance_db`, `template_db`. Reads `.env` via python-dotenv with sensible defaults matching `.env.example`.

### 5.2 `dojo/db.py`

- `connect(dbname, autocommit=False)` → psycopg connection.
- `clone_template(clone_name)` — connect to maintenance DB (autocommit), `DROP DATABASE IF EXISTS clone WITH (FORCE)`, then `CREATE DATABASE clone TEMPLATE dojo_template`. Use `psycopg.sql.Identifier` composition everywhere; never f-string identifiers.
- `drop_database(name)` — `DROP DATABASE IF EXISTS … WITH (FORCE)`.

### 5.3 `conftest.py` fixtures

- `template_ready` (session, autouse): if `dojo_template` doesn't exist, `pytest.exit("Template 'dojo_template' missing. Run: dojo seed", returncode=1)`.
- `lesson_db` (function scope): clones the template to `dojo_test_<lesson_slug>`, yields a connection, drops the clone afterward. Used by every lesson that mutates state (DDL, DML, Part 4, Part 5).
- `shared_lesson_db` (module scope): same, but one clone per lesson module, with the connection opened in **autocommit mode** (Parts 1–2 are read-only, and without this a learner's syntax error in ex1 would abort the shared transaction and poison every later exercise in the module with `InFailedSqlTransaction`). Used by read-only lessons (Parts 1–2 correctness gates) so a 4-exercise lesson doesn't pay 4 clone costs. Lesson test files choose which fixture to use; the authoring rule is: **read-only exercises use `shared_lesson_db`; anything that executes DDL/DML/VACUUM uses `lesson_db`.**
- `pytest_runtest_logreport` hook: after each lesson test's call phase, record the outcome into `data/progress.json` via `dojo.progress` (see §9.1). Only tests under `lessons/` are recorded. Failures increment `attempts`; passes set `passed_at` (and, for `review`-marked tests, advance the review schedule).

### 5.4 `dojo/plan.py`

`Plan` class wrapping `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` output:

- `nodes()` — flattened walk of the plan tree.
- `node_types()`, `has_node(t)`, `uses_index(name)`.
- `execution_time_ms`, `planning_time_ms` properties.
- `render()` — human-readable plan summary used in failure messages. Improve on v1's flat `" -> ".join(types)`: render an indented tree, one node per line, with actual rows and per-node time, and mark the most expensive node.

`explain(conn, query, params=None, analyze=True, timing=True) -> Plan`. *(Implementation note: `timing=False` issues `EXPLAIN (ANALYZE, TIMING OFF, …)` — used by all speed measurements, because per-node clocks add per-row overhead that unfairly penalizes plans flowing many rows.)*

### 5.5 `dojo/timing.py`

- `measure_execution_ms(conn, query, repeats=5, warmup=1)` — best-of-N `EXPLAIN ANALYZE` execution time after warmup runs (measured with `TIMING OFF`, see above).
- `cached_baseline(conn, key, query)` — look up `data/baseline.json` by key (the exercise ID); if absent, measure the naive query now and cache it. Baselines are per-machine and reset by deleting the file (`dojo reset-baseline` does this).

### 5.6 `dojo/grader.py`

All assertions raise `AssertionError` with multi-line teaching messages.

- `assert_rows_equal(actual, expected, ordered=False)` — on mismatch, report: expected vs actual row counts, column-count mismatch called out explicitly ("your query returns 4 columns, expected 3 — check your SELECT list"), first 5 rows of each side, and — when counts match but content differs — the first differing row pair. When `ordered=True` and the rows are equal as multisets but differently ordered, say exactly that ("right rows, wrong order — check your ORDER BY").
- `assert_plan(plan, must_have=None, must_not_have=None, uses_index=None)` — each failure prints the rendered plan tree and one sentence of guidance (e.g. for a lingering `Seq Scan`: "Postgres is still reading the whole table — is your index on the column the WHERE clause filters?").
- `assert_faster_than_baseline(measured_ms, baseline_ms, ratio, floor_ms=2.0)` — skip when baseline is below the floor; otherwise report baseline, yours, target, and achieved multiple.
- `assert_scalar(conn, check_sql, expected, label)` — run a check query returning one value; compare; message includes the check SQL and both values. (Workhorse for DML/operational gates.)

### 5.7 `dojo/catalog.py` (new — powers Part 4)

Catalog assertions against `information_schema`/`pg_catalog`, each with teaching messages:

- `assert_table(conn, name, columns: dict[str, str] | None)` — table exists; optionally column name → type-prefix mapping (`"numeric"` matches `numeric(10,2)`).
- `assert_not_null(conn, table, column)`
- `assert_pk(conn, table, columns)`
- `assert_unique(conn, table, columns)`
- `assert_check(conn, table, must_mention: str)` — a CHECK constraint whose definition mentions a substring (e.g. `rating`).
- `assert_fk(conn, table, columns, ref_table, on_delete=None)`
- `assert_view(conn, name)`
- `assert_index(conn, table, columns_prefix)` — an index whose leading columns match.
- `rejects(conn, dml_sql)` / `accepts(conn, dml_sql)` — assert a probe INSERT/UPDATE fails (or succeeds) under the learner's constraints; failure message shows the probe statement and explains what should have stopped it. Run probes in a savepoint/rolled-back transaction so they never leave state behind.

### 5.8 `dojo/lesson.py`

`Exercise(dir)` helper: `.solution_sql`, `.expected_sql`, `.indexes_sql`, `.hints_path`, `.reference_dir`, `.apply_indexes(conn)`, `.fetch(conn, sql)`. `Lesson(test_file_path)` exposes `.slug`, `.dir`, `.setup_sql`, `.exercise(name) -> Exercise`. All file reads return `""` for absent files.

---

## 6. Grading gate families

Every exercise's `test_lesson.py` function is short, explicit, and **quoted verbatim in the lesson README** so the learner always knows exactly what is being checked. Four families:

**A. Correctness gate** (Parts 1–3 querying): run `expected.sql` and the student's `solution.sql` against the same clone; `assert_rows_equal`. Use `ordered=True` iff the prompt demands an ordering. This is the whole gate for fundamentals — no plan or speed checks, so beginners aren't punished for style.

**B. State gate** (DML, transactions, operational): apply the student's `solution.sql` (on a separate autocommit connection when the lesson involves `VACUUM`/transaction-control statements, since those can't run inside psycopg's implicit transaction), then `assert_scalar` checks on the resulting database state. Example (upsert lesson): after running the student's `INSERT … ON CONFLICT`, assert the target row's new value and that the table's row count grew by exactly the expected amount.

**C. Catalog gate** (Part 4 schema design): apply the student's DDL from `solution.sql`, then a battery of `dojo.catalog` assertions plus `rejects()/accepts()` probes proving the constraints actually bite. Where the exercise migrates data (normalization lessons), also correctness-check a reconstruction query joining the new tables against the original denormalized data.

**D. Performance gate** (Part 5): the v1 three-stage gate, kept intact:

```python
expected = ex.fetch(conn, ex.expected_sql)                      # rows from naive reference
baseline = timing.cached_baseline(conn, EX_ID, ex.expected_sql) # naive speed, cached per-machine
ex.apply_indexes(conn)                                          # student's DDL
actual = ex.fetch(conn, ex.solution_sql)
grader.assert_rows_equal(actual, expected)
p = plan.explain(conn, ex.solution_sql)
grader.assert_plan(p, must_not_have=["Seq Scan"])               # per-exercise shape spec
measured = timing.measure_execution_ms(conn, ex.solution_sql)
grader.assert_faster_than_baseline(measured, baseline, ratio=8)
```

Plan-shape specs must accept all legitimately good plans (e.g. both `Index Scan` and `Bitmap Heap Scan` count as "used the index" — assert `must_not_have=["Seq Scan"]` rather than demanding one node type, unless the lesson is specifically about that node type). *(Implementation note: a few lessons use lower ratios where the physics demand it — bitmap heap scans over scattered rows (38 ex2, ratio 3), BRIN over 43k matched rows (43 ex1, ratio 5), capstone aggregation (47 ex1, ratio 5).)*

---

## 7. Exercise anatomy and authoring rules

- Each **core exercise** (`ex1`, `ex2`, …) is required for lesson completion. 2–4 per lesson.
- Each lesson has at most one **challenge** exercise (`challenge/`), marked `@pytest.mark.challenge` — harder, sometimes combining earlier topics. Optional for progress; `dojo status` shows it separately.
- Parts 1–2 lessons each ship exactly one **review variant** (`review1/`), marked `@pytest.mark.review`: a fresh prompt exercising the same core concept with different tables/predicates, used only by the spaced-review scheduler (§9.3). Deselected from normal runs via marker (`-m "not review"` is applied by `dojo test`; plain `pytest` still runs everything, which is fine for CI/verify).
- Core exercises may only require concepts taught in the current lesson or earlier ones. The curriculum order in §11 is the dependency order. **Challenge exercises are exempt**: a challenge may preview one future concept, provided its hints teach that concept well enough to attempt it (the §11 "teaser" challenges rely on this).
- Prompts must be **unambiguous about output**: name the exact columns, in order, and state whether ordering matters. (Correctness gates compare literal rows; a vague prompt makes the gate feel arbitrary.)
- Stubs must fail the gate as shipped (`SELECT 1;`), and the README tells the learner what the first failure will look like, so a fresh checkout has a known state.
- Solution stubs carry a one-line comment header naming the lesson/exercise and pointing at the README section.

---

## 8. Hints system

Each exercise ships `hints.md`:

```markdown
## Hint 1
A nudge: restate the problem, name the concept. No syntax.

## Hint 2
The approach: which clause/construct to reach for and why. Skeleton allowed
(`SELECT … FROM orders WHERE …`), no complete answer.

## Hint 3
Nearly the solution: everything but the final assembled query.
```

Rules: exactly 2 or 3 tiers per exercise (3 for anything non-trivial); Hint 3 must still leave at least one decision to the learner.

CLI behavior:

- `dojo hint 08_inner_joins ex2` — reveal the **next** unrevealed tier for that exercise, print it (rendered via rich), and increment `hints_used` for that exercise in `progress.json`. Once all tiers are revealed, re-print them all.
- Hints used are displayed in `dojo status` (a gentle honesty mechanism, no penalty).
- The learner is trusted not to open `hints.md`/`expected.sql`/`.reference/` directly; the CLI just makes the honest path the convenient path. Do not encrypt or obfuscate.

---

## 9. Progress tracking and spaced review

### 9.1 `data/progress.json`

```json
{
  "exercises": {
    "08_inner_joins::test_ex2": {
      "attempts": 3,
      "passed_at": "2026-07-20T18:04:11Z",
      "hints_used": 1
    }
  },
  "reviews": {
    "08_inner_joins::test_review1": {
      "due": "2026-07-23",
      "interval_index": 0,
      "history": [{"date": "2026-07-20", "passed": true}]
    }
  }
}
```

Written by the conftest hook (§5.3) and the hint command. All timestamps UTC. Corrupt/missing file → treated as empty (never crash the test run over progress bookkeeping).

### 9.2 `dojo status` and `dojo next`

Both commands read curriculum structure from `dojo/curriculum.py` — a checked-in manifest listing parts → lesson slugs → exercise names in order. This is the single source of truth for ordering and lets `dojo status` render the full course tree even before lesson dirs exist; `dojo verify` lints the manifest against the actual `lessons/` tree (every manifest entry has a dir and vice versa).

- `dojo status` — a rich tree grouped by Part → lesson → exercise: passed / attempted-not-passed / untouched; challenge and review shown distinctly; per-lesson hint counts; a header line with overall completion (core exercises only) and count of reviews due today.
- `dojo next` — print the first incomplete core exercise in curriculum order, with the lesson dir and the exact test command to run. If reviews are due, mention that too ("3 reviews due — `dojo review`").

### 9.3 Spaced review

- When all core exercises of a Part 1–2 lesson first pass, its review variant is scheduled at `today + 3` days.
- Interval ladder: **3 → 7 → 21 → 60 days**. Passing a due review advances to the next interval; failing resets to the start of the ladder (due again in 3 days).
- `dojo review` — list due review exercises; `dojo review run` — run pytest on all due review tests (`-m review` plus a node-id list); outcomes update the schedule via the same conftest hook.
- Review is advisory: nothing blocks course progress. It exists to fight the "I did joins three weeks ago and remember nothing" failure mode.

---

## 10. CLI reference (`dojo/cli.py`)

argparse with subcommands; every command prints what it's doing and exits nonzero on failure. Makefile targets are one-line wrappers (`make up` → `docker compose up -d`, `make seed` → `uv run dojo seed`, etc.) for muscle-memory compatibility.

| command | behavior |
|---|---|
| `dojo up` / `dojo down` | docker compose up -d / down |
| `dojo seed` | build `dojo_template` (drop + recreate + generate + ANALYZE), then regenerate `docs/dataset_facts.md` |
| `dojo test <lesson> [ex]` | run pytest for a lesson dir (or a single exercise's test), with `-m "not review"`; e.g. `dojo test 08_inner_joins ex2` → `pytest lessons/08_inner_joins/test_lesson.py::test_ex2` |
| `dojo hint <lesson> <ex>` | reveal next hint tier (§8) |
| `dojo status` | progress dashboard (§9.2) |
| `dojo next` | suggest next exercise (§9.2) |
| `dojo review [run]` | list / run due reviews (§9.3) |
| `dojo plan <lesson> [ex]` | clone, apply the exercise's `indexes.sql` + run `solution.sql` under EXPLAIN, print the rendered plan tree — no gate. For quick iterate-on-plan loops in Part 5 |
| `dojo lab <lesson>` | create/refresh a persistent clone `dojo_lab_<slug>` with the lesson's `setup.sql` applied, then exec `psql` into it for free experimentation |
| `dojo lab --clean` | drop all `dojo_lab_*` databases |
| `dojo reset-baseline` | delete `data/baseline.json` (speed targets recalibrate on next run) |
| `dojo verify [lesson]` | author/CI mode — see §13 |

---

## 11. Curriculum

48 lessons (00–47) in 7 parts. Numbering is flat and continuous; part boundaries live in the README curriculum map. For each lesson below: **objectives** and **exercises** (`C` = challenge). Gate family per §6 is noted where it isn't obvious from the part. Lesson authors flesh these into full prompts/prose per the quality bar in §12.

### Part 0 — Orientation

- **00_hello_dojo** — Verify the toolchain; meet the dataset and the gameplay loop. Ex1: run a provided `SELECT count(*) FROM customers` and paste it into `solution.sql` (gate: correctness). Ex2: a first tiny query written solo (all columns of one specific product — the README teaches the `WHERE id = …` form inline, ahead of lesson 02, per §12). README doubles as a tour of `dojo test`, `dojo hint`, `dojo status`, `docs/dataset.md`.

### Part 1 — SQL fundamentals (gate family A throughout; `shared_lesson_db`)

- **01_select_basics** — SELECT lists, column order, aliases (`AS`), `DISTINCT`, `LIMIT`. Ex1 specific columns from `products`; Ex2 aliased computed column (price with tax); Ex3 distinct countries; C: distinct (category, color) pairs from jsonb attributes (teaser for later).
- **02_where_filtering** — comparisons, `AND/OR/NOT` precedence, `IN`, `BETWEEN`, `LIKE`/`ILIKE`. Ex1 orders over a total; Ex2 combined predicates with parentheses; Ex3 pattern-match names; C: tricky OR-precedence bug to fix.
- **03_order_limit** — multi-key `ORDER BY`, `DESC`, `NULLS FIRST/LAST`, `OFFSET` and its pitfalls, top-N. All exercises `ordered=True`. C: top-5-per-category *without* window functions (correlated LIMIT teaser — hard on purpose).
- **04_expressions_functions** — arithmetic, `ROUND`, string functions (`concat`, `upper`, `substring`), `COALESCE`, `CASE`. Ex: price tiers via CASE; display-name building; C: formatted label with nested functions.
- **05_null_logic** — three-valued logic, `IS NULL`, `IS DISTINCT FROM`, NULLs in comparisons/aggregates/`NOT IN`. Uses `staff.manager_id` (the one naturally NULL column). Ex: find the CEO; a `NOT IN`-with-NULL trap exercise whose hint explains *why* it returns nothing. (The trap needs the one-line form `NOT IN (SELECT manager_id FROM staff)` — subqueries proper arrive in lesson 13, so this README teaches that single form inline, per §12.)
- **06_aggregates** — `COUNT(*)` vs `COUNT(col)`, `SUM/AVG/MIN/MAX`, `FILTER (WHERE …)`. Ex: order stats; conditional counts per status via FILTER; C: one row of company-wide KPIs.
- **07_group_by_having** — grouping semantics ("every selected column is grouped or aggregated"), `HAVING` vs `WHERE`, grouping by expressions. Ex: revenue per status; customers with >N orders; C: monthly revenue via `date_trunc` (previews 18).
- **08_inner_joins** — join syntax, table aliases, join keys vs filter predicates, multi-table joins. Ex1: order + customer names; Ex2: three-table join (orders→items→products); Ex3: join with aggregation (revenue per category); C: five-table report.
- **09_outer_joins** — `LEFT/RIGHT/FULL`, NULL-extension, the **anti-join** pattern (`LEFT … WHERE right.id IS NULL`), and the classic "filter in ON vs WHERE" distinction. Ex: customers with zero orders; products never ordered; C: ON-vs-WHERE felt in your hands.
- **10_self_joins_hierarchies** — self-joins on `staff`; employee↔manager pairs; same-department pairs without duplicates (`a.id < b.id`). C: employees earning more than their manager.
- **11_set_operations** — `UNION [ALL]` / `INTERSECT` / `EXCEPT`, column-compatibility, dedup semantics. C: symmetric difference of two customer segments.
- **12_fundamentals_capstone** — one multi-exercise business report ("quarterly review") drawing on everything in Part 1. 3 exercises, no new concepts, prompts written as stakeholder requests rather than SQL specs.

### Part 2 — Intermediate querying (gate family A; `shared_lesson_db`)

- **13_subqueries** — scalar subqueries, `IN (subquery)`, correlated subqueries, `EXISTS`/`NOT EXISTS` (and why `NOT EXISTS` beats `NOT IN` with NULLs — callback to 05). C: latest order per customer via correlated subquery.
- **14_ctes** — `WITH` for readability, multiple/chained CTEs, and a gentle **recursive CTE** finale walking the staff org chart (depth per employee). C: the upward management chain.
- **15_window_functions_1** — `OVER ()`, `PARTITION BY`, `ROW_NUMBER`/`RANK`/`DENSE_RANK`, top-N-per-group done right (revisits 03's challenge, now easy). Windows vs GROUP BY framed explicitly.
- **16_window_functions_2** — `ORDER BY` inside windows, frames (`ROWS BETWEEN`), running totals, `LAG/LEAD` deltas, moving averages, `NTILE`. C: month-over-month revenue growth in one query.
- **17_conditional_pivots** — pivoting with `CASE`+aggregates and `FILTER`; one row per category, one column per status. C: the reverse — a graded un-pivot query reconstructing long-form (category, status, revenue) rows from the wide shape.
- **18_dates_times** — `date_trunc`, `EXTRACT`, interval arithmetic, `generate_series` (incl. joining a series to find gap days — scoped to a single customer's *events*, where zero-activity days actually exist), timestamptz vs timestamp in one honest paragraph.
- **19_text_jsonb** — string ops (`split_part`, `position`, regexp basics) and JSONB operators (`->`, `->>`, `@>`, `jsonb_array_elements`) against `products.attributes` and `events.payload`. Correctness-only here; the *indexing* of these patterns returns in Part 5.
- **20_querying_capstone** — an analytics mini-project: daily active customers, a signup-cohort conversion grid, and a top-movers report. 3 exercises; window+CTE+date heavy.

### Part 3 — Modifying data and transactions (gate family B; `lesson_db`)

- **21_insert_update_delete** — INSERT (multi-row, from SELECT), UPDATE with FROM, DELETE with USING, `RETURNING`. Gates: state assertions (row counts, specific values) after applying the student's DML.
- **22_upsert** — unique constraints as the foundation; `INSERT … ON CONFLICT DO UPDATE / DO NOTHING`; idempotency (gate runs the student's statement **twice** and asserts the second run changes nothing).
- **23_transactions** — `BEGIN/COMMIT/ROLLBACK`, savepoints, why DDL is transactional in Postgres; a scripted transfer-funds exercise asserting atomicity. Injection mechanism: the student's script must contain the literal marker line `-- INJECT FAILURE HERE`; the gate splits the script on that marker, executes the first half, then executes a statement that raises (e.g. divide-by-zero), catches the exception, executes the remainder (which should contain the student's ROLLBACK/error handling), and finally asserts balances are unchanged. Run on an autocommit connection so the student's own transaction-control statements are in charge.

### Part 4 — Schema design and modeling (gate family C; `lesson_db`)

- **24_ddl_and_types** — CREATE TABLE; choosing types (text vs varchar, numeric vs float for money — with a float-rounding demo exercise, timestamptz, boolean, arrays vs join tables). Gate: catalog assertions on the table the student designs.
- **25_constraints** — NOT NULL, DEFAULT, UNIQUE, CHECK, FK with `ON DELETE` behaviors. Gate: catalog assertions **plus `rejects()` probes** — the student's constraints must actually reject bad rows (negative price, orphan FK, duplicate email).
- **26_normalization** — given a deliberately awful `flat_orders` table (created by this lesson's `setup.sql`), decompose to 3NF: write DDL + `INSERT … SELECT` migration. Gate: catalog shape of the new tables + a reconstruction join that must reproduce the original rows exactly. README teaches 1NF→3NF with this concrete table, not abstract math.
- **27_views** — CREATE VIEW for naming a query; view-over-view; where views help vs hide cost. Gate: view exists + querying it yields expected rows.
- **28_altering_live_schemas** — ALTER TABLE add/drop/rename; adding a NOT NULL column to a populated table (nullable → backfill → SET NOT NULL); adding a constraint `NOT VALID` then `VALIDATE`. Gate: end-state catalog + data assertions. README explains *why* the multi-step dance matters (locks), sowing seeds for Part 5.
- **29_design_capstone** — a prose spec ("we're adding gift cards: balances, redemptions, partial use, expiry…") that the student turns into a schema. Gate: catalog battery + accepts/rejects probes + a few round-trip queries. Multiple correct designs must pass — gate on properties (FKs exist, amounts can't go negative), not exact table names beyond the required entry points named in the prompt.

### Part 5 — Performance and indexing (gate family D; `lesson_db`; this is v1's curriculum, re-authored to assume Parts 1–4)

- **30_reading_explain** — EXPLAIN vs EXPLAIN ANALYZE; Seq Scan, rows, loops, buffers; `dojo plan` and `dojo lab` introduced. Gate: correctness-only; exercises are "run and read" with questions answered in SQL.
- **31_first_index** — B-tree on one column; Seq Scan → Index Scan; 8x speed gate. The v1 lesson 02, with an added ex2: demonstrate the index does *nothing* for a predicate on a different column.
- **32_composite_indexes** — multi-column indexes; column-order intuition (equality first, then range).
- **33_left_prefix** — why `(a,b)` serves `WHERE a=…` but not `WHERE b=…` alone; ex on FK columns (`order_items.order_id`) — the "FKs aren't auto-indexed" payoff.
- **34_index_only_scans** — covering indexes, `INCLUDE`, the visibility map (and why a just-updated table spoils IOS until VACUUM — foreshadows 44). Gate note: after `apply_indexes`, the test runs `VACUUM <table>` on a separate autocommit connection before EXPLAIN, so the visibility map covers the new index's table (v1's proven pattern) — otherwise `Index Only Scan` won't appear even for correct solutions.
- **35_order_by_and_indexes** — indexes providing order; eliminating Sort nodes; `DESC` indexes; top-N via index. *(Implementation note: ex1 carries a LIMIT — without it the planner happily sorts a handful of rows and the no-Sort gate can't be satisfied.)*
- **36_statistics_and_the_planner** — `ANALYZE`, `pg_stats`, selectivity estimates; a scripted stale-stats scenario (`setup.sql` builds a stats-less copy with autovacuum off) the student fixes with `ANALYZE`. Gate family B+D mix.
- **37_join_algorithms** — nested loop vs hash vs merge; reading join nodes in plans; why the planner switches when indexes appear.
- **38_bitmap_scans** — bitmap index/heap scans; combining two single-column indexes with `AND`/`OR`.
- **39_partial_indexes** — tiny index over a filtered subset (`WHERE status = 'pending'`); predicate must match the query.
- **40_expression_indexes** — `lower(email)` lookups; the expression must match exactly.
- **41_gin_fulltext** — `tsvector`/`tsquery`, GIN, `LIKE '%…%'` vs full-text; ranking briefly.
- **42_gin_jsonb** — GIN on `products.attributes`/`events.payload` for `@>` containment (callback to 19).
- **43_gist_brin** — BRIN for the naturally-ordered `events.ts` (huge index-size win shown in numbers); mention of GiST for ranges/geo.
- **44_mvcc_vacuum_bloat** — dead tuples, `pg_stat_user_tables`, VACUUM (gate: dead-tuple count drops ≥90% after student's solution, autovacuum disabled for determinism); fillfactor/HOT as prose.
- **45_partitioning** — declarative range partitioning of an events copy; partition pruning visible in EXPLAIN. Gate: plan shows pruning + correctness.
- **46_materialized_views** — materialize an expensive aggregate; `REFRESH MATERIALIZED VIEW [CONCURRENTLY]`; staleness trade-off. Gate: correctness + speed vs the raw-aggregate baseline.

### Part 6 — Capstone

- **47_capstone** — a slow, realistic reporting query plus an operational scenario. Three exercises: (1) hit an aggressive speed target using anything from Parts 1–5; (2) a schema-change deployment done safely (Part 4 skills under Part 5 constraints); (3) a "diagnose from the plan" exercise: given a bad plan in the README, find and fix the cause in SQL. Completing this lesson completes the course.

---

## 12. Lesson authoring quality bar

Every lesson README follows this structure (v1's proven shape, extended):

1. **Cold open** — 2–4 paragraphs of teaching prose motivating the concept with *this* dataset ("`orders` has 500,000 rows; so far every query you've written scans all of them…"). Concrete numbers from `docs/dataset_facts.md`, never invented ones.
2. **Concept** — the mental model, with one worked example the learner can paste into `dojo lab`. Diagrams as ASCII/Mermaid where they genuinely help.
3. **Exercises** — one subsection per exercise: the prompt (exact output columns, ordering requirement), which file to edit, the command to run. Challenge clearly labeled with an honest difficulty note.
4. **The gate** — the test function quoted verbatim in a code block, followed by a plain-English restatement of each check.
5. **The teaching point** — one closing paragraph: what this looks like in real production work.

Style rules: second person, direct, concrete; short paragraphs; no bullet-point walls; every claim about the data checked against `dataset_facts.md`; SQL keywords uppercase in prose and examples; no solution SQL for core exercises anywhere in the README (worked examples must differ from exercise answers — the sole exception is lesson 00 ex1, whose README provides the query by design; a handful of DDL exercises whose gate probes are the real teacher also spec the DDL openly); each README ends by naming the next lesson. Where a lesson's exercise needs a construct formally taught later (00's `WHERE id = …`, 05's one-line `NOT IN (SELECT …)`), the README teaches that form inline in a sentence or two — §11 flags these cases.

Failure-message rule of thumb: a learner who reads only the pytest failure output should know (a) which check failed, (b) what the evidence is, and (c) which README section to reread.

---

## 13. Verification (`dojo verify`) — non-negotiable

`dojo verify [lesson]` proves the course is solvable:

1. For each exercise (core, challenge, and review) of each lesson: clone the template, copy `.reference/` files over the student stubs **in a temp copy of the lesson tree** (never touch the working tree), run that exercise's real pytest gate against the temp tree, and report pass/fail. The temp tree must include a copy of the root `conftest.py` (otherwise fixtures aren't discovered), and verify sets `DOJO_NO_PROGRESS=1` in the environment — the progress hook checks this and skips recording, so verify runs (including the deliberate pristine-stub failures) never touch the learner's `data/progress.json` or review schedule.
2. Additionally lint: every exercise has `hints.md` with 2–3 `## Hint N` sections; every core/challenge/review test function has a matching exercise dir and vice versa; stubs as shipped **fail** their gate (run once with pristine stubs and assert failure); every Part 1–2 lesson has exactly one review exercise; README quotes a code block containing the test function's body.
3. Exit nonzero on any failure; print a per-lesson table.

CI (GitHub Actions, `postgres:16` service container): seed with reduced volumes via env override (`DOJO_SCALE=0.1` scales row counts; speed gates auto-skip under the 2 ms floor — verify only guarantees correctness/plan gates in CI, full-volume verification is run locally before release), then `pytest tests/` + `dojo verify`.

Harness unit tests (`tests/`) cover: config parsing; Plan tree walking/rendering against canned EXPLAIN JSON; every grader assertion's pass and fail paths (assert the *messages* contain their key evidence); catalog assertions against a scratch schema; timing floor behavior; progress read/write/review-ladder transitions; lesson/exercise file loading; one smoke test that clones the template and runs a trivial gate end-to-end.

---

## 14. Build order (milestones)

Build in this order; each milestone has a hard acceptance check. Do not start lesson authoring before M3 passes.

- **M1 — Infrastructure.** Repo scaffold, pyproject/uv, docker-compose, `.env.example`, config, db, schema.sql, seed.py + facts.py, Makefile. ✔ `uv run dojo up && uv run dojo seed` completes; `docs/dataset_facts.md` generated; row counts match §4.2.
- **M2 — Harness.** plan, timing, grader, catalog, lesson, conftest fixtures + progress hook, progress.py. ✔ all `tests/` pass against the seeded template.
- **M3 — CLI + verify.** cli.py with every §10 command; verify.py with lint rules; lab and plan_lesson ports. ✔ `dojo status` renders an all-untouched tree from the curriculum; `dojo verify` runs (vacuously green with zero lessons); `dojo hint`/`dojo next`/`dojo review` behave on empty state.
- **M4 — Part 0 + Part 1** (lessons 00–12, with hints, challenges, review variants, references). ✔ `dojo verify` green for all 13 lessons; pristine stubs fail; spot-check three READMEs against §12.
- **M5 — Part 2 + Part 3** (13–23). ✔ verify green cumulative.
- **M6 — Part 4** (24–29) including the `setup.sql` scenarios and probe-based gates. ✔ verify green cumulative.
- **M7 — Part 5 + capstone** (30–47), porting v1's proven gate patterns. ✔ verify green cumulative **at full data volume**, including speed gates, on the local machine.
- **M8 — Polish.** Learner README (setup, gameplay loop, curriculum map, troubleshooting incl. the IPv6/localhost note and baseline reset), docs/dataset.md, CI workflow, final `dojo verify` + `pytest` full green.

Definition of done: fresh clone → `uv venv && uv pip install -e ".[dev]" && cp .env.example .env && uv run dojo up && uv run dojo seed` → `uv run dojo next` points at lesson 00 → `uv run dojo verify` fully green → `uv run dojo status` shows 48 lessons, all core exercises pending.

---

## 15. Non-goals

No web UI, no accounts, no multi-user anything, no LLM calls at runtime, no SQL parsing/linting of the learner's queries (the database is the judge), no Windows-native support beyond what Docker Desktop provides, no attempt to hide answers cryptographically from the person the course belongs to.
