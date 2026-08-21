# Reading - 15_window_functions_1

`GROUP BY` collapses rows to answer questions about groups. Window functions
answer questions about groups **without collapsing anything** — each row
keeps its identity and gains context. Half of real reporting needs exactly
that, and before SQL:2003 there was no good way to express it.

## Notes

**The mental model.** For each row, a window function looks at a *window* of
related rows and computes a value. `OVER ()` makes the window the entire
result set. `OVER (PARTITION BY category)` makes it the rows sharing that
row's category. `OVER (ORDER BY x)` adds a direction and, for aggregates,
turns the window into "everything up to here" (lesson 16). The row itself is
always in its own window.

**`PARTITION BY` is `GROUP BY` that does not collapse.** That single sentence
covers most of the lesson. `avg(price) OVER (PARTITION BY category)` gives
every product its category's average, on the same row, with no join and no
subquery — which is the same answer lesson 13's correlated subquery
produced by re-running an aggregate once per row.

**Where windows sit in the evaluation order.** After `FROM`, `WHERE`,
`GROUP BY` and `HAVING`; before `ORDER BY` and `LIMIT`. Two consequences you
will hit immediately:

- You cannot filter on a window function in `WHERE` — it has not been
  computed. Compute it in a CTE or derived table and filter outside. That
  restriction *is* the top-N-per-group idiom.
- The window sees the rows that survived `WHERE`. Filtering before ranking
  changes the ranks, which is usually what you want and occasionally a bug —
  "rank among all staff" and "rank among the staff shown" are different
  reports.

**The numbering trio.**

| function | ties | gaps | use for |
|---|---|---|---|
| `row_number()` | broken arbitrarily | n/a | pick exactly one row per group |
| `rank()` | share a number | yes (1,1,3) | competition placing |
| `dense_rank()` | share a number | no (1,1,2) | "how many levels above me" |

`row_number()` without a deterministic `ORDER BY` inside the `OVER` is
non-deterministic: two rows with equal sort keys can swap between runs. Add
a unique tie-break — usually the primary key — every single time.

**The ranked-CTE idiom.** Number the rows, filter outside:

```sql
WITH ranked AS (
    SELECT ..., row_number() OVER (PARTITION BY g ORDER BY k DESC, id) AS rn
    FROM t
)
SELECT ... FROM ranked WHERE rn <= 5;
```

This is the answer to top-N-per-group, latest-per-key, best-per-category —
an enormous family of real questions, and a standard interview filter
because it cleanly separates people who reach for `OFFSET` in a loop, people
who write a correlated subquery, and people who window. PostgreSQL also
offers `DISTINCT ON` for the special case of N = 1 (lesson 49), and
`LATERAL` for the case where you need N rows *and* the per-group query is
expensive (lesson 48).

**A performance note.** A window function requires its input sorted by
`PARTITION BY` then `ORDER BY`. PostgreSQL will add a `Sort` node, or skip it
if an index already provides that order — which is exactly the situation
lesson 35 engineers deliberately. Windowing three million raw rows when
thirty-one aggregated rows would do is a real and common production smell:
aggregate first in a CTE, window over the small result.

**`WINDOW` clause.** When several functions share a window, name it once:
`... rank() OVER w, dense_rank() OVER w ... WINDOW w AS (ORDER BY salary
DESC)`. It reads better and guarantees the definitions cannot drift apart.

## ex1 — the salary leaderboard

`row_number()` with an explicit tie-break, and the outer `ORDER BY` matching
it. Two different `ORDER BY` clauses in one query doing two different jobs —
one defines the numbering, one defines the output order — is worth sitting
with for a moment. They are frequently the same and are not required to be.

## ex2 — each product against its category

One window function; no join, no `GROUP BY`, no subquery. Compare this
against what lesson 13 would need: a correlated scalar subquery re-computing
a category average for every one of 10,000 rows. Same answer, very different
query, and the window version sorts once.

## ex3 — top-5 per category, the right way

Lesson 03's challenge, which took a correlated subquery and a paragraph of
apology, is now four lines. This is the moment the course pays back the
earlier struggle — and the reason the earlier struggle was worth having, is
that you now know *what* is being replaced.

## ex4 — rank versus dense_rank, side by side

The difference, visible in one result set. The practical consequence is a
question to ask whenever someone asks for "rank": if two people tie for
third, should the next person be fourth or third? Stakeholders have an
opinion and have never articulated it.

## ex5 — how far from the category average?

The window function used as an ordinary expression, inside arithmetic,
inside `round()`. That composability is the thing to take away: a window
function is a value like any other, and the only special rule is *where* it
may appear in the query.

## ex6 — the latest row per group

The idiom in its most common form. Worth noting what the tie-break does
here beyond determinism: with `row_number()` you get exactly one row per
customer guaranteed, whereas `rank() ... WHERE rnk = 1` would return two
rows for a customer with two orders at the same instant. Which one you want
is a real decision — "the latest order" usually means exactly one.

## challenge — departmental podium

`rank()` rather than `row_number()`, so a tie for third place shows both
people. The exercise exists to make you choose the numbering function on
purpose rather than by habit.

The consequence is that the result no longer has a fixed row count: with
`row_number()` you get exactly three rows per department, with `rank()` you
get three *or more*. Downstream code that assumed "three per group" — a
fixed-height chart, a template with three slots, a test asserting fifteen
rows — breaks on the day of the first tie. Choosing `rank()` is a decision
about the report's contract, not just about fairness.

## review1 — page 2 by row_number

The same rows `OFFSET 10 LIMIT 10` would give, computed a different way.
The reason to know the window version: `OFFSET` cannot paginate *per group*.
"Rows 11-20 of each category" is trivial with `row_number()` and impossible
with `OFFSET`.

The two versions are not equivalent in cost, though, and not in the
window's favour. `ORDER BY price DESC, id LIMIT 10 OFFSET 10` can stop after
twenty rows if an index supplies the order; the `row_number()` version must
number every one of the 10,000 products before it can discard 9,990 of them.
Use the window when you need per-group paging or the rank itself as a value —
not as a general replacement for `LIMIT`.

## Further reading

- [Window Functions Tutorial](https://www.postgresql.org/docs/16/tutorial-window.html) — the gentlest correct introduction, with the evaluation-order rules that explain why you cannot filter in `WHERE`.
- [Window Function Calls](https://www.postgresql.org/docs/16/sql-expressions.html) — the syntax: `PARTITION BY`, `ORDER BY`, frames, and the `WINDOW` clause.
- [Window Functions](https://www.postgresql.org/docs/16/functions-window.html) — the built-in list: `row_number`, `rank`, `dense_rank`, `ntile`, `lag`, `lead`, `first_value`, `nth_value`.
- [`SELECT` — `DISTINCT ON`](https://www.postgresql.org/docs/16/sql-select.html) — PostgreSQL's shortcut for the N = 1 case of ex6. Lesson 49 makes it a whole topic.
