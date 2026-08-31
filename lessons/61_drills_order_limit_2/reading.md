# Reading - 61_drills_order_limit_2

Ordering again, at the edges: NULL placement, deep pagination, and sort keys
that never appear in the output.

## Notes

Three things this set drills that lesson 03 introduced and nobody practises
enough.

**NULL placement is a choice.** PostgreSQL's default is `NULLS LAST` for
ascending and `NULLS FIRST` for descending - which is consistent (NULL sorts
as if it were larger than everything) and is still not what most reports
want. `ORDER BY manager_id DESC NULLS LAST` overrides it. Because the default
flips with the direction, changing a sort from ascending to descending
silently moves your NULL rows from the bottom of the report to the top.

**A sort key does not have to be selected.** `ORDER BY price DESC` is legal
in a query that returns only `id` and `name`. That is genuinely useful, and
it is also the one place a reader of your output cannot check your work - so
say in the prompt, the ticket, or a comment what the rows are ordered by.
(The exception arrives with `SELECT DISTINCT` and set operations, where the
sort key *must* appear in the select list, because the rows being sorted are
no longer the rows you read.)

**`OFFSET` is a scan, not a seek.** The server produces every row you skip
and throws it away, so page 500 costs five hundred pages of work. It is fine
for the first few pages of a UI and wrong for a batch export; lesson 52
replaces it with keyset pagination.

## ex1 - category listing, priciest first

A warm-up that tests mixed directions across three keys where the SELECT list
order and the sort key order deliberately do not line up. The classic mistake
is assuming the two lists are the same and sorting by `id` second because it
is the second column. The model answer names the keys the prompt named. The
reference uses ordinal positions to make the mismatch visible - readable
here, fragile in a codebase.

## ex2 - the five highest paid

This tests the canonical top-N shape and the distinction between "the top
five" and "everyone above a threshold". The classic mistake is the threshold,
which produces four rows one week and nine the next. The model answer sorts
and limits. Interviewers ask the follow-up on purpose: with `LIMIT 5` a tie
at fifth place is broken arbitrarily unless you say how, which is what the
`id` key is for.

## ex3 - deciding where the NULL goes

This tests NULL placement and the fact that its default flips with the sort
direction. The classic mistake is assuming NULLs always sort last, which is
true for `ASC` and false for `DESC`, so reversing a report quietly moves the
NULL rows across it. The model answer states `NULLS LAST` explicitly. The
reference sorts on the boolean `manager_id IS NULL` first, which is the
portable trick for dialects without the modifier.

## ex4 - page three of the directory

This tests offset arithmetic - page N with size S skips `(N - 1) * S` rows -
and the tie-break that makes paging reproducible at all. The classic mistake
is an under-specified sort: with ties in `name` and no `id` key, the same row
can appear on both page two and page three, or on neither. The model answer
makes the order total first and pages second. Duplicate rows across pages are
almost always this bug.

## ex5 - the latest cancellations

This tests the interaction of `WHERE`, `ORDER BY` and `LIMIT`, and the
logical order in which they apply. The classic mistake is imagining `LIMIT`
runs first - "the ten newest orders, of which the cancelled ones" - which
would return anywhere from zero to ten rows. The model answer filters, then
orders, then limits. Reading the clauses as a pipeline in that sequence
settles most beginner confusion about what `LIMIT` sees.

## ex6 - sorting by a column you did not select

This tests that sort keys are independent of the select list, which surprises
people who think of `ORDER BY` as operating on the output. The classic
mistake is adding `price` to the SELECT list to "make it sortable" and
failing the gate on column count. The model answer sorts by a column it never
returns. One caveat for later: under `SELECT DISTINCT` or a `UNION` the sort
key *must* be in the select list, because the rows being ordered are no
longer the table's rows.

## ex7 - NULLs plus a second key

This tests attaching a NULL modifier to one key of several, and keeping the
remaining directions straight. The classic mistake is putting `NULLS LAST` at
the end of the whole list, where it modifies the tie-break instead of the
column that actually has NULLs. The model answer attaches it to
`manager_id`. Writing a modifier that matches the current default is not
noise: it is the only thing that keeps the report stable when the direction
changes.

## ex8 - deep into a three-key listing

The composite: a total three-key order with a direction change, consumed a
page at a time. This tests whether pagination and multi-key sorting can be
held in your head at once, which is exactly what a "give me the next page of
this report" ticket asks for. The classic mistake is an incomplete sort, so
rows shuffle between pages and the export gains duplicates. The model answer
makes the order total, then offsets.

## Further reading

- [Sorting Rows](https://www.postgresql.org/docs/16/queries-order.html) - the ORDER BY clause including NULLS FIRST / NULLS LAST and the defaults per direction.
- [LIMIT and OFFSET](https://www.postgresql.org/docs/16/queries-limit.html) - why deep OFFSET is expensive and why LIMIT needs a deterministic order.
- [SELECT reference page](https://www.postgresql.org/docs/16/sql-select.html) - the formal grammar: which expressions ORDER BY may name, and the DISTINCT restriction.
- [Use The Index, Luke - Paging Through Results](https://use-the-index-luke.com/sql/partial-results) - offset versus keyset pagination, with the plans that explain the difference.
