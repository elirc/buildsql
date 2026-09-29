# Vol3 / sql-a authoring brief (read this in full, then write)

You are writing PostgreSQL curriculum for the IPSKILL app. The canonical rules
are in `C:\Users\Owner\Desktop\buildsql\content-src\AUTHORING_SPEC.md` — read
that file first, in full. This brief adds the volume-specific conventions and
the dataset you must write against. Everything here overrides nothing in the
spec; it makes it concrete.

## What you produce

You do NOT write JSON. You write plain files into a per-lesson directory under
`C:\Users\Owner\Desktop\buildsql\content-src\vol3\build\<slug>\`. An assembler
turns them into JSON. Exact layout, for each lesson:

```
<slug>/meta.json            {"slug": "...", "title": "...", "summary": "..."}
<slug>/briefing.md
<slug>/explanation.md
<slug>/fullReadme.md
<slug>/fullReading.md
<slug>/ex1/prompt.md
<slug>/ex1/hints.md
<slug>/ex1/importantHints.md
<slug>/ex1/solution.sql
<slug>/ex1/expected.sql
<slug>/ex2/...  ... through ex8/
<slug>/challenge/{prompt.md,hints.md,importantHints.md,solution.sql,expected.sql}
<slug>/review1/{prompt.md,hints.md,importantHints.md,solution.sql,expected.sql}
```

Ten mission directories exactly: `ex1..ex8`, `challenge`, `review1`.
Every mission has all five files. `solution.sql` is the model answer;
`expected.sql` is a **second, differently-spelled but result-equivalent** query
(the gate's reference). They must not be byte-identical and must not be trivial
reformattings — use a genuinely different construction where one exists
(subquery vs window, `DISTINCT ON` vs `row_number()`, `LEFT JOIN` vs `NOT
EXISTS`, an explicit frame vs the default, etc.). Both must be valid
PostgreSQL 16 and return the same rows, same column order, same ordering.

Write files with bash heredocs (`cat > path <<'EOF' ... EOF`, quoted delimiter
so nothing is expanded). Create directories first with `mkdir -p`.

## The database (fixed, deterministic; do not invent tables or columns)

Seven tables. No secondary indexes exist except primary keys.

- `customers` (50,000): `id` int PK, `name` text, `email` text
  (`user{id}@example.com`), `country` text (12 ISO-2 codes; US 11,733,
  GB 6,025, DE 5,724, FR 2,985, CA 2,975), `created_at` timestamptz
  (2021-11-14 .. 2023-11-14).
- `products` (10,000): `id` int PK, `name` text (e.g. `Nova Kettle 812`),
  `category` text (books, electronics, garden, toys, clothing, food),
  `price` numeric(10,2) (1.05 .. 499.80), `description` text,
  `attributes` jsonb (`{"color":...,"size":...,"tags":[...]}`).
- `orders` (500,000): `id` int PK, `customer_id` int FK, `status` text
  (pending 83,003 / paid 250,472 / shipped 83,164 / cancelled 83,361),
  `total` numeric(10,2) (5.00 .. 1999.99, avg 1004.58), `created_at`
  timestamptz spanning 2022-11-14 .. 2023-11-14.
- `order_items` (1,000,000): `id` int PK, `order_id` int FK, `product_id`
  int FK, `quantity` int 1..5, `price` numeric(10,2).
- `reviews` (1,000,000): `id` int PK, `product_id` int FK, `rating` int 1..5
  (roughly 200k each), `body` text, `created_at` timestamptz over ~1 year.
- `events` (3,000,000): `id` bigint PK, `customer_id` int (no FK, no index),
  `event_type` text (view 1,385,159 / click 691,906 / add_to_cart 462,169 /
  logout 230,480 / purchase 230,286), `payload` jsonb
  (`{"path":"/p/<product id>","value":0..1000}`), `ts` timestamptz strictly
  increasing with `id`, one event per second, 2023-10-11 04:53 ..
  2023-11-14 22:13.
- `staff` (500): `id` int PK, `name` text, `department` text (sales 138,
  support 91, engineering 112, ops 98, finance 61), `manager_id` int FK to
  staff (NULL only for the CEO, Karen Welch), `salary` numeric(10,2)
  40k..250k, `hired_on` date over 10 years. Org tree is 4 levels deep.

Useful known facts you may cite: customer 4242 has 6 orders totalling 4319.67;
5,003 customers have zero orders; 300 products were never ordered; average
review rating is 3.00.

Do not claim a specific numeric answer you have not derived — prefer phrasing
like "31 rows" (derivable) over invented totals. Row counts you can reason
about (days in a month, statuses × days, 500 staff, 6 categories) are fine.

## Voice, shape and length (non-negotiable)

- Second person, calm, technical, opinionated. No hype, no emoji, no "in this
  lesson we will learn". Markdown hard-wrapped at ~78 columns.
- `briefing`: opens `# <title>`, 900-1800 words. Motivates the topic by
  connecting back to earlier sectors (lessons 15/16 taught the OVER clause;
  49 taught DISTINCT ON; 30-40 taught EXPLAIN and indexes; the vol3 sectors
  reference each other by slug). Then a `## Concept` section with real SQL
  fences, then one `## Exercise N — <short name>` heading per exercise
  mirroring the mission prompts, then `## Challenge` and `## Spaced review`.
- `explanation`: opens `# Reading - sql/<slug>`, 900-1600 words, note-shaped:
  a `## Notes` section of **bolded lead-in** paragraphs about the real
  mechanism and its edge cases, then a short per-mission paragraph
  (`## ex1 — ...`) saying what the exercise is really testing and the classic
  mistake, then `## Further reading` with 4-6 real postgresql.org/docs/16
  links with a sentence each on why.
- `fullReadme`: 1200-2500 words, the deep archive version — concepts, worked
  examples in fences, common mistakes, an explicit "## The interview answer"
  section, and a "## Check yourself" bank of 8-15 questions.
- `fullReading`: 1200-2500 words, long-form essay — how the feature works
  underneath (executor nodes: WindowAgg, Sort, Memoize, tuplestore spilling
  to disk, `work_mem`), standards/API history (SQL:2003 windows, SQL:2011
  frame extensions, PostgreSQL 8.4 introducing them, 11 adding GROUPS and
  frame exclusion), performance notes, and an honest "when NOT to use it".
  Do not repeat `fullReadme` verbatim; different angle, essay prose.
- Nothing may be duplicated across lessons. Each of your 80-per-volume
  exercises must be genuinely distinct from every other.

## Exercise prompt format (required)

Each `prompt.md` is one `## Exercise N — <name>` (or `## Challenge — <name>` /
`## Spaced review`) heading followed by:

1. Which file to edit: "Edit `exN/solution.sql`."
2. The table shape it works against, stated explicitly — name the table(s) and
   the columns you rely on with their types, e.g. "`orders(id int, customer_id
   int, status text, total numeric(10,2), created_at timestamptz)`".
3. Concrete sample rows and the expected output for them, in a fence, so the
   learner can check semantics by hand. Use a small hand-made illustration
   table when that is clearer than real data — but say plainly that it is an
   illustration of the rule, and state what the real query must return.
4. The exact required columns **in order**, with aliases in backticks, and the
   exact required `ORDER BY`, in bold.
5. Any rounding / tie-break rules, spelled out.
6. Ends with a fenced run command, plain fence, exactly:

```
uv run dojo test <slug> ex1
```

Difficulty rises across ex1..ex8. The challenge combines two or three ideas
from the sector. `review1` re-tests the sector's ideas from a different angle
(and may reach back to an earlier sector's tool).

## Hints

`hints.md` = `## Hint 1`, `## Hint 2`, `## Hint 3`. Hint 1 reframes the problem
without SQL. Hint 2 shows a related but NON-identical snippet. Hint 3 narrates
the shape of the answer while leaving one real decision to the learner.
`importantHints.md` = a second, different three-tier escalation from another
entry point (e.g. start from the wrong answer and diagnose it, or start from
the execution model, or start from the result shape) — not a paraphrase of
`hints.md`. Never paste the full solution in either file.

## Correctness bar

Every reference query must actually run on PostgreSQL 16 against the schema
above. Watch for the real traps and get them right:

- Aggregates over `numeric` return `numeric`; `avg` returns `numeric` too, so
  `round(x, 2)` works. `round(double precision, int)` does NOT exist — if you
  ever produce a float (e.g. from `percentile_cont`, `/` on floats,
  `extract(epoch ...)`), cast: `round(x::numeric, 2)`.
- `percentile_cont` / `percentile_disc` are ordered-set aggregates:
  `percentile_cont(0.5) WITHIN GROUP (ORDER BY x)`. `percentile_cont` over
  numeric returns double precision — cast before rounding.
- Window functions are not allowed in `WHERE`/`HAVING`; wrap in a subquery/CTE.
- `RANGE`/`GROUPS` frame offsets require exactly one `ORDER BY` column of an
  orderable type; `RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW`
  needs a date/timestamp ORDER BY column.
- The default frame with `ORDER BY` is `RANGE BETWEEN UNBOUNDED PRECEDING AND
  CURRENT ROW`, which includes peers — a real difference from `ROWS` when the
  order key has ties.
- `date_trunc('day', created_at)` returns timestamptz; `::date` is often nicer.
  Be consistent within a query and say which one the output has.
- `generate_series` with timestamps needs a step interval and returns
  timestamptz; casting to `date` is common for calendar spines.
- `count(*)` vs `count(col)` over a LEFT JOIN.
- Deterministic tie-breaks: always add a unique column to `ORDER BY` when the
  prompt promises a specific row, or the answer is non-deterministic.

If you are unsure whether a construction is legal, choose the one you are
certain of. A correct, slightly plainer query beats a clever wrong one.
