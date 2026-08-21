# Reading - 14_ctes

A CTE does two unrelated things that happen to share a keyword: it gives a
subquery a name, and — with `RECURSIVE` — it expresses iteration, which no
amount of joining can. The first changes how your SQL reads; the second
changes what SQL can say.

## Notes

**`WITH` turns nesting into a pipeline.** Three levels of parentheses is
where a subquery stops being readable. `WITH a AS (...), b AS (SELECT ...
FROM a), c AS (SELECT ... FROM b) SELECT ... FROM c` reads top to bottom
like a paragraph, and — crucially — it is *debuggable*: run the `WITH`
prefix with `SELECT * FROM a` at the end and you can inspect any
intermediate step. Debugging a report CTE by CTE until the numbers stop
making sense is the single most useful technique in analytics work.

**Name each step after its business meaning.** `qualified_orders`,
`first_purchases`, `monthly_revenue`. A reviewer who can read the CTE names
and follow the argument will actually review the query; one who meets `t1`,
`t2`, `t3` will rubber-stamp it.

**CTEs are inlined since PostgreSQL 12 — mostly.** Before 12, a CTE was an
*optimisation fence*: always materialised, never pushed into. Since 12, a
CTE that is referenced exactly once and is not recursive and has no side
effects gets folded into the main query like any subquery, so you pay
nothing for readability. When you want the old behaviour — because the CTE
is expensive and referenced three times, or because you are deliberately
stopping the planner from pushing a filter down — say `AS MATERIALIZED`.
`AS NOT MATERIALIZED` forces the other way. Knowing that this knob exists is
Part 5 material; reaching for it before you have read a plan is premature.

**Recursion: how it actually runs.** `WITH RECURSIVE name AS (base UNION ALL
step)` evaluates the base term once into a working table, then repeatedly
runs the step against *only the rows produced by the previous iteration*,
appending results, until an iteration produces nothing. Three consequences:

- The termination condition is that the step eventually returns zero rows.
  A cycle in the data — employee A manages B manages A — means it never
  does, and the query runs until it exhausts disk. Guard real hierarchies by
  carrying an array of visited ids and adding `WHERE NOT s.id = ANY(path)`,
  or by capping `depth`.
- `UNION` instead of `UNION ALL` deduplicates each round, which is slower
  but does terminate on cyclic graphs.
- The reference to the CTE inside the step may appear exactly once, and not
  in a subquery or an outer join's nullable side. These are real
  restrictions and PostgreSQL will tell you about them.

**Recursion is not just for trees.** Generating a series, walking a linked
list, running a fixed-point computation, splitting a string into rows — all
the same shape. Anything where "the next state depends on the previous
state" is recursive-CTE territory. For plain integer or timestamp series,
`generate_series()` is the practical tool and is far faster.

**Where CTEs stop.** A CTE cannot see the *current row* of an enclosing
query — it is evaluated as a standalone relation. When you need "for each
row of A, run this query against B", that is a `LATERAL` join (lesson 48) or
a correlated subquery, not a CTE.

## ex1 — name the intermediate step

Aggregate first, join second. Notice the row count is unchanged from lesson
07's version of the same question — the CTE bought readability, not
different results. That is the point: `WITH` is a refactoring tool.

It also buys testability. Replace the final `SELECT` with `SELECT * FROM
heavy_buyers` and you can inspect the intermediate result on its own, which
is not possible with the same logic buried in a subquery three levels deep.
When a report disagrees with someone's spreadsheet, running it CTE by CTE
until the numbers diverge is how you find out who is right.

## ex2 — a chained pipeline

The first genuinely two-stage query in the course: compute revenue per
category, then compare each against the average *of those six numbers*. The
subtle bit is that the average is over categories, not over line items — six
values averaged, not a million. Getting that wrong produces a plausible
number that answers a different question, and it is exactly the kind of
error naming your steps makes visible.

## ex3 — the whole org chart

Type it rather than pasting it, and make sure you can say why it stops: the
step joins `staff` to the rows added in the previous round, and once the
deepest level has been reached no staff row has a `manager_id` in that set,
so the round returns nothing. Four levels here; the same six lines handle
forty.

## ex4 — two CTEs, joined

Aggregate each side separately, then join the small results. This is the
standard cure for the fan-out problem from lesson 08: instead of joining
first and then trying to un-duplicate with `count(DISTINCT ...)`, you never
create the duplicates. It is also usually *faster*, because both aggregates
run over their own table and the join happens on twelve rows instead of half
a million.

## ex5 — recursion without a hierarchy

The minimal recursive CTE, with nothing to distract from the mechanism.
Worth doing once and then never again in production — `generate_series(1,
12)` is the real answer, and the reason to know it is that "the months that
should exist" is the missing half of every `GROUP BY` time series (lesson
07's notes, lesson 12's ex5).

## ex6 — one person's whole subtree

Same six lines, different base case. Once you see that the base case
*selects the roots you care about* and the step *walks one edge*, the whole
family of hierarchy questions collapses into one template: subtree of X,
ancestors of X (join the other way — the challenge), all leaves, depth of
each node, path to root.

## challenge — the management chain

Recursion upward. The step joins `staff s ON s.id = chain.manager_id` rather
than `s.manager_id = chain.id`, which is the entire difference between
"everyone below me" and "everyone above me". Carrying `pos` through the
recursion gives you an ordering the outer query can sort by — recursion
produces rows in an unspecified order, so if you need a sequence, compute it
in the CTE.

## review1 — pending revenue per country

A one-CTE warm-up. When it comes back, name the CTE something a stakeholder
would recognise and notice how much the query improves for free.

Two checks while it runs. Twelve rows, one per country — and would a country
whose customers have placed no pending orders appear at all? No: the CTE
filters to pending orders before the join, so a country with none vanishes
rather than showing zero. Whether that is right depends on whether the
reader is comparing countries. That question — "does a missing row mean
zero, or does it mean nothing happened?" — never stops being worth asking.

## Further reading

- [`WITH` Queries (CTEs)](https://www.postgresql.org/docs/16/queries-with.html) — the definitive page. Read the recursive section, the cycle-detection example, and the `MATERIALIZED` notes.
- [`SELECT` — `WITH` clause](https://www.postgresql.org/docs/16/sql-select.html) — the restrictions on where the recursive self-reference may appear.
- [Set Returning Functions](https://www.postgresql.org/docs/16/functions-srf.html) — `generate_series` for numbers and timestamps: the practical alternative to ex5, and the tool for filling gaps in a time series.
- [`SEARCH` and `CYCLE` clauses](https://www.postgresql.org/docs/16/queries-with.html) — PostgreSQL 14+ syntax that makes depth-first ordering and cycle detection declarative instead of hand-rolled.
