# Reading - 17_conditional_pivots

A pivot is not a feature. It is `GROUP BY` plus one aggregate per output
column, each scoped to its own slice — which is why PostgreSQL never needed
a `PIVOT` keyword and why you can build far stranger grids than a `PIVOT`
keyword would allow.

## Notes

**Conditional aggregation is the whole idea.** "One row per category, one
column per status" means: group by category, and for each status write an
aggregate that only sees that status's rows. `FILTER (WHERE ...)` scopes an
aggregate; the older `sum(CASE WHEN ... THEN x ELSE 0 END)` does the same
thing less readably. Both make exactly one pass over the data.

**`FILTER` and `CASE` differ on the empty case.** With no matching rows,
`sum(x) FILTER (WHERE ...)` is **NULL** and `sum(CASE WHEN ... THEN x ELSE 0
END)` is **0** — because the second form contributed a real zero for every
non-matching row. Neither is right; a report should choose deliberately.
`coalesce(sum(x) FILTER (...), 0)` gets the zero without abandoning `FILTER`.
`count` is the exception that catches people: it returns 0 over zero rows,
so a count-based pivot never needs the `coalesce`.

**The old `CASE` idiom has a trap.** `count(CASE WHEN cond THEN 1 END)`
works, because the missing `ELSE` yields NULL and `count` skips NULLs. Add
`ELSE 0` "for tidiness" and it counts every row in the group, because 0 is
not NULL. This bug is in production somewhere near you.

**Windows layer on top of aggregates.** `sum(count(*)) OVER ()` is legal and
useful: grouping happens first, then the window sees the grouped rows. That
one line gives you every "percentage of total", "share of parent", and
"rank among groups" column without a second query or a self-join. The
reverse — an aggregate over a window function — is not allowed, because the
window has not been computed yet. The evaluation order from lesson 07 is
doing all the explaining here.

**Unpivoting: columns back into rows.** The PostgreSQL idiom is a `LATERAL`
join against an inline `VALUES` list, which can mention the current row:

```sql
FROM wide w
CROSS JOIN LATERAL (VALUES ('paid', w.paid), ('pending', w.pending))
           AS v(status, revenue)
```

Each wide row explodes into one row per pair. `unnest(ARRAY[...])` does the
same job for a single column. Lesson 48 makes `LATERAL` a topic in its own
right.

**When *not* to pivot in SQL.** When the column set is dynamic. "One column
per month, forever" means a schema change every month, or generated SQL, or
the `crosstab()` function from the `tablefunc` extension — which needs the
column list up front anyway. The rule that production reporting stacks
converge on: **SQL emits long form; the presentation layer rotates.** Long
form has a stable schema, tests cleanly, and every BI tool, spreadsheet and
dataframe library can pivot it in one line. Pivot in SQL when the columns
are a small, closed set — four order statuses, three salary bands — and the
result is a final artefact rather than an input to something else.

## ex1 — the revenue grid

Four filtered aggregates over a three-table join, and the join's grain is
what makes it correct: `sum(quantity * price)` over line items, not over
orders. Also worth checking: do the four columns sum to the category's total
revenue? They must, because the four statuses partition the orders.

## ex2 — signups by year, the CASE way

Written the old way on purpose, because you will read it in legacy code far
more often than you write it. Note the prompt's requirement that a country
with no 2022 signups shows 0 — that is the `ELSE 0` question, and with
`count` it resolves itself.

## ex3 — salary bands per department

Three counts, three half-open bands. The bands come from lesson 04 and the
`FILTER` from lesson 06; nothing here is new, which is the point of a pivot —
it is composition, not a feature. Check that each row's three numbers sum to
that department's headcount.

## ex4 — each group's share of the whole

`sum(count(*)) OVER ()` is the line worth memorising. It appears in every
"share of total" column ever written, and the `100.0` rather than `100` is
the second detail: integer division would truncate the ratio to zero before
`round` ever saw it. Cast or use a numeric literal whenever you divide.

## challenge — unpivot it back

`LATERAL` earns its introduction here: the `VALUES` list refers to `w.paid`
and `w.pending` from the row on its left, which an ordinary subquery in
`FROM` cannot do. Round-tripping a grid back to long form is a genuinely
useful skill when someone hands you a wide spreadsheet and the rest of your
pipeline expects tidy data.

## review1 — average order total per status

Four `avg(...) FILTER (...)` aggregates on one row. Two things to predict
before running: whether any status could produce NULL here (no — all four
statuses have orders), and whether the four averages average to the overall
average (no — that would require equal group sizes, and `paid` is half the
table).

## Further reading

- [Aggregate Expressions — `FILTER`](https://www.postgresql.org/docs/16/sql-expressions.html) — the syntax and where `FILTER` may appear.
- [`FILTER` versus `CASE`](https://modern-sql.com/feature/filter) — Markus Winand on the empty-set difference and portability.
- [`tablefunc` / `crosstab()`](https://www.postgresql.org/docs/16/tablefunc.html) — PostgreSQL's actual pivot function, and why its fixed column list is a real constraint.
- [Table Expressions — `LATERAL`](https://www.postgresql.org/docs/16/queries-table-expressions.html) — the unpivot idiom's engine. Lesson 48.
