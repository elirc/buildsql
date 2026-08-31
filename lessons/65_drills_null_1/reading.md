# Reading - 65_drills_null_1

Eight drills on the only value in SQL that is not equal to itself. Read this
after you have attempted them, pass or fail.

## Notes

The unifying rule of this set: NULL is not a value, it is the absence of one,
so every operator you hand it returns "unknown" rather than an answer. That
single fact explains all eight problems. Comparisons (`=`, `<>`, `>`) return
NULL instead of true or false; `WHERE` keeps only rows where the predicate is
literally TRUE, so unknown rows disappear silently; arithmetic and `||`
propagate NULL through the whole expression; and `NOT IN` against a list
containing NULL can never return true. The tools that survive contact with
NULL are the ones that were designed for it: `IS NULL`, `IS DISTINCT FROM`,
`IS NOT TRUE`, `coalesce`, `nullif`, and `concat`. Learn which of your
everyday operators are NULL-blind and you stop being surprised.

## ex1 - is there a manager or not

The point of putting `manager_id IS NOT NULL` in the SELECT list is to see
that it returns a real boolean - true or false, never NULL - while
`manager_id = something` would return NULL for the CEO's row. The classic
mistake is `manager_id <> NULL`, which yields NULL for every row including
rows that clearly have a manager, so a filter built on it returns nothing at
all. Model answer: test with `IS NOT NULL`, which is the only comparison in
SQL guaranteed to answer true or false.

## ex2 - coalesce, and the type trap inside it

This drills the substitution habit and the type rule that comes with it.
`coalesce` is variadic and strictly typed: every argument is resolved to a
single common type, so mixing an integer column with a text default is an
error rather than a silent cast. The classic mistake is reaching for
`coalesce(manager_id, 'none')` and reading the resulting message as a bug in
your logic instead of a missing `::text`. Model answer: cast the column to
text first, then substitute, because a display placeholder is a display
concern.

## ex3 - the pipe operator versus concat

Two ways to build the same string, one of which quietly deletes the row's
whole label when a single input is missing. `||` is strict (NULL in, NULL
out) because it is an ordinary operator; `concat()` is a function that
documents itself as ignoring NULL arguments, so the CEO gets `Name -> ` with
a dangling arrow rather than nothing at all. The classic mistake is building
a display name with `||` and then wondering why a handful of rows in a report
are blank. Model answer: use `||` when a missing part should invalidate the
whole string, `concat` when it should not.

## ex4 - where NULLs sort

Sorting is the one place where SQL does give NULL a defined position: it
sorts as though it were larger than everything, which means the default
placement flips when you add `DESC`. That asymmetry is the trap. The classic
mistake is writing `ORDER BY manager_id DESC` for a "biggest first" report
and getting the row with no value at the top, above the actual maximum -
which looks like a data bug and is not one. Model answer: whenever a sort key
is nullable, write `NULLS FIRST` or `NULLS LAST` explicitly and stop thinking
about the default.

## ex5 - aggregating nothing at all

A bare aggregate query always returns exactly one row, even when its input is
empty - and that row is mostly NULLs, because `sum`, `avg`, `min` and `max`
have nothing to report. `count` is the exception and answers 0. The classic
mistake is a dashboard that prints an empty cell instead of a zero, or worse,
arithmetic like `sum(total) * 1.2` that turns the whole KPI row NULL. Model
answer: `coalesce` on the outside of the aggregate, because the substitution
belongs to the result, not to the rows that were never there.

## ex6 - DISTINCT thinks NULLs are equal

Deduplication uses a different notion of sameness than `=` does. Two NULLs
are never equal under a comparison, yet `DISTINCT` and `GROUP BY` collapse
them into a single output row, because both are defined in terms of "not
distinct from" rather than "equals". The classic mistake is assuming NULL
rows vanish from a `DISTINCT` list the way they vanish from a `WHERE` clause;
they do not, they arrive as one anonymous entry at the end. Model answer:
`SELECT DISTINCT`, and remember that `GROUP BY` would give you the identical
result set.

## ex7 - NOT IN, and the empty answer

This is the single most expensive NULL bug in professional SQL, because the
symptom is an empty result rather than an error. `NOT IN` is defined as a
chain of `<>` comparisons joined by AND, so one NULL in the list makes every
row's predicate unknown, and unknown rows are dropped. The classic mistake is
to conclude "there are no such staff" and ship it. Model answer: exclude the
NULLs from the subquery explicitly, or use `NOT EXISTS`, which is immune
because it tests whether a matching row exists rather than comparing values.

## ex8 - the rows a WHERE clause throws away

Splitting a table into "kept" and "rejected" halves is a routine reporting
job - reconciliation, audit trails, "why is this row missing" queries - and
with a nullable column in the predicate the naive complement loses rows from
both halves at once. `NOT (unknown)` is `unknown`, so the CEO row fails both
the filter and its negation. The classic mistake is trusting that the two
queries partition the table; count them and they will not add up. Model
answer: `IS NOT TRUE` collapses false and unknown into one honest bucket.

## Further reading

- [Comparison Functions and Operators](https://www.postgresql.org/docs/16/functions-comparison.html) - `IS NULL`, `IS DISTINCT FROM`, and the `IS TRUE`/`IS NOT TRUE` family in one short page.
- [Conditional Expressions](https://www.postgresql.org/docs/16/functions-conditional.html) - `COALESCE`, `NULLIF`, `CASE`, `GREATEST`/`LEAST` and how each treats NULL.
- [String Functions and Operators](https://www.postgresql.org/docs/16/functions-string.html) - the reference that spells out why `||` returns NULL and `concat()` does not.
- [`SELECT` - the `ORDER BY` clause](https://www.postgresql.org/docs/16/sql-select.html#SQL-ORDERBY) - `NULLS FIRST` / `NULLS LAST` and the defaults that flip with `DESC`.
