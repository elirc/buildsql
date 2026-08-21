# Reading - 05_null_logic

SQL's logic has three values, not two, and every surprising NULL story is a
consequence of that one fact. This is the lesson that separates people who
have been bitten from people who are about to be.

## Notes

**NULL is not a value; it is the absence of one.** That is why it has no
equality: asking whether one unknown equals another unknown cannot be
answered `true` or `false`, so SQL answers `unknown`. Every comparison
operator behaves this way, including `<>`, `<`, and `>`.

**`WHERE` keeps rows where the condition is `true` — and only `true`.**
`unknown` is discarded exactly like `false`, silently and without a warning.
This single rule generates almost all NULL bugs, because the query does not
fail; it returns a smaller, plausible answer.

**`NOT` cannot rescue you.** `NOT unknown` is `unknown`. So `WHERE NOT
(status = 'x')` drops NULL-status rows just as surely as `WHERE status = 'x'`
does — the same row is missing from *both* halves of what looks like a
complete partition. If you have ever had two reports that were each correct
and did not add up to the total, this was probably why.

**The `NOT IN` trap.** `x NOT IN (a, b, NULL)` expands to `x <> a AND x <> b
AND x <> NULL`. That last conjunct is `unknown`, and `true AND unknown` is
`unknown`, so the whole predicate can never be `true` — the query returns
**zero rows**, always, no matter the data. Note the asymmetry: `IN` with a
NULL is merely unhelpful (it can still return `true` on a real match), while
`NOT IN` with a NULL is catastrophic. This is why experienced reviewers stop
at every `NOT IN (SELECT ...)` and ask one question: *can that column be
NULL?* If it is declared `NOT NULL`, the shape is safe forever, and the
declaration is the proof. If it is nullable, use `NOT EXISTS` (lesson 13),
which compares row-by-row and is completely immune, or filter the NULLs out
inside the subquery.

**The tools for working with NULL deliberately:**

- `IS NULL` / `IS NOT NULL` — the only correct way to *test* for absence.
- `IS DISTINCT FROM` / `IS NOT DISTINCT FROM` — comparison that treats NULL
  as an ordinary comparable value. `NULL IS DISTINCT FROM 5` is `true`;
  `NULL IS NOT DISTINCT FROM NULL` is `true`. Reach for these whenever
  "different" should include "one side is missing".
- `coalesce` — substitute a value at the edge of the system (lesson 04).
- Aggregates skip NULLs, which is usually what you want and occasionally a
  trap: `avg` over a column that is 90% NULL is the average of the other
  10%, reported without comment (lesson 06).
- `UNIQUE` constraints treat NULLs as distinct from each other, so a
  nullable unique column accepts unlimited NULL rows (lesson 25).

**Why NULL exists at all.** Because "we do not know this customer's phone
number" is genuinely different from "their phone number is the empty
string", and a database that cannot express the difference forces every
application to invent a magic sentinel — `-1`, `''`, `'1900-01-01'` — which
is worse in every way. NULL is the right idea with famously sharp edges. The
design response is not to ban it but to *declare* `NOT NULL` wherever
absence is meaningless, which turns whole categories of this lesson's bugs
into schema errors. Lesson 25 makes that concrete.

## ex1 — find the CEO

`WHERE manager_id IS NULL`. Try `= NULL` in the lab first: no error, no
warning, zero rows. PostgreSQL parses it, evaluates it to `unknown` for every
row, and returns an empty set with a straight face.

Some databases have historically offered a setting that makes `= NULL`
behave like `IS NULL` for compatibility with old client code. PostgreSQL
does not, and that is a feature: a query that means two different things
depending on a server setting is a query nobody can review. `IS NULL` is
four characters longer and unambiguous everywhere.

## ex2 — the NOT IN trap

The boss fight, and the reason it is memorable is that the failure is
*total* rather than partial. Zero rows out of five hundred. Partial failures
you argue with; total failures you investigate. Note what the fix does not
require: no change to the outer query, no `NOT EXISTS`, just
`WHERE manager_id IS NOT NULL` inside the list, removing the poison at the
source.

## ex3 — NULL is contagious

Propagation through arithmetic. The same rule covers `||` (which is why
`concat()` exists — it treats NULL as an empty string instead), `upper()`,
`round()`, and essentially every scalar function. When a computed column
comes back full of unexpected NULLs, the bug is almost always one nullable
input several expressions upstream.

## ex4 — when NOT IN is safe

The point of this exercise is the *reasoning*, not the rows.
`order_items.product_id` is declared `NOT NULL` and enforced by a foreign
key, so the subquery cannot produce a NULL, so `NOT IN` cannot be poisoned —
and no future data can change that without a schema migration. This is what
constraints buy you: not just data hygiene, but the ability to prove a query
is correct. When the column is *not* declared `NOT NULL`, you have no such
proof, and `NOT EXISTS` is the right reflex.

There is a second reason to distrust `NOT IN (subquery)`, and the
`order_id <= 1000` narrowing is hiding it from you. Remove it and the query
takes *minutes* on this dataset. PostgreSQL would like to answer `NOT IN` by
hashing the subquery's results, but the hashed strategy is only valid when
NULLs are provably absent and the values fit in `work_mem` — miss either
condition and it falls back to re-scanning the subquery per outer row, which
is 10,000 × 1,000,000 comparisons. `NOT EXISTS` and the `LEFT JOIN ... IS
NULL` anti-join (lesson 09 ex2 asks this exact question that way) both plan
as a proper hashed anti-join and finish in milliseconds. So the reviewer's
rule has two halves: `NOT IN (subquery)` is a correctness hazard on nullable
columns *and* a performance hazard on large ones. The idiom that is never
either is `NOT EXISTS`.

## challenge — IS DISTINCT FROM

`<> 1` returns 499 rows minus the CEO — 498. `IS DISTINCT FROM 1` returns
499. One row, and it is the row a human would obviously expect to be there.
`IS DISTINCT FROM` is the operator to reach for whenever you are comparing
two things that might each be missing — change-detection queries ("has this
column changed since yesterday?") are the canonical case, and they are
subtly broken with `<>` on every nullable column.

## review1 — finance staff with a manager

Two conditions, one of them a NULL test. When this comes back in three days,
notice that "has a manager" cannot be written as `manager_id <> NULL`, and
that nothing in the SQL will remind you.

There is a quieter point in this one. Filtering to `finance` *and* "has a
manager" happens to be redundant on this data — every finance employee has a
manager, since the only manager-less row is the CEO. A redundant condition
is harmless today and load-bearing tomorrow, when someone promotes a finance
director to report to nobody. Writing the condition you mean, rather than
the condition the current data makes sufficient, is what keeps a query
correct as the data changes.

## Further reading

- [Comparison Functions and Operators](https://www.postgresql.org/docs/16/functions-comparison.html) — the truth tables, `IS DISTINCT FROM`, and `IS NULL`. The authoritative source for everything above.
- [`NOT IN` and NULL](https://www.postgresql.org/docs/16/functions-subquery.html) — the subquery expressions page; read the `NOT IN` paragraph slowly, twice.
- [Don't Do This — NULL handling](https://wiki.postgresql.org/wiki/Don%27t_Do_This) — including why a nullable column with a magic sentinel is worse than a NULL.
- [`NOT NULL` constraints](https://www.postgresql.org/docs/16/ddl-constraints.html) — the schema-level answer to this entire lesson. Preview of lesson 25.
