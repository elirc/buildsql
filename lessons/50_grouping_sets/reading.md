# Reading - 50_grouping_sets

`GROUPING SETS` lets one query produce several different `GROUP BY`
results at once, in one pass over the data. It is the difference between a
report built from four queries that might disagree and a report built from
one that cannot.

## Notes

**The mental model.** `GROUP BY GROUPING SETS ((a, b), (a), ())` is
`UNION ALL` of three grouped queries — by `(a, b)`, by `(a)`, and by nothing
at all — except that PostgreSQL computes them together, sharing the scan and
often sharing the sort. The output columns are the union of all the grouping
columns; a row produced by a set that does not include a column carries NULL
there.

**`ROLLUP` and `CUBE` are shorthands, and they mean different things.**
`ROLLUP (a, b, c)` gives the *hierarchical* subsets — `(a,b,c)`, `(a,b)`,
`(a)`, `()` — which is what you want for nested dimensions: year → month →
day, country → region → city. `CUBE (a, b, c)` gives *every* subset, all
eight of them, which is what you want for independent dimensions you intend
to cross. Choosing the wrong one produces either missing subtotals or a
result three times larger than the question.

**The NULL ambiguity, and `GROUPING()`.** A subtotal row has NULL in the
columns it is not grouped by — but a real group can also have NULL there, if
the data has NULLs. The two are indistinguishable by looking. `GROUPING(col)`
returns 1 when `col` was *not* part of that row's grouping set and 0 when it
was, which disambiguates them exactly:

```sql
CASE WHEN grouping(category) = 1 THEN 'ALL CATEGORIES' ELSE category END
```

Any report that ships subtotals to humans wants labels built this way,
because "NULL" in a category column is not a word anyone should have to
interpret.

**Ordering the output.** The rows come back in whatever order the
implementation produces; a report almost always wants subtotals positioned
deliberately. Sort by `grouping(...)` first, then by the column — that puts
detail rows before their subtotal, or after it, on purpose.

**Why it beats `UNION ALL` of separate queries.** One scan instead of N.
One consistent snapshot, so the parts cannot disagree with the whole. And
one query to maintain when the revenue definition changes — which it will.

**Where the work actually happens.** `EXPLAIN` shows a `GroupAggregate` or
`HashAggregate` with a `Group Key` and several `Sort Key`/`Group Key` lines,
or a `MixedAggregate` node. PostgreSQL will reuse a single sorted input for
several grouping sets when it can, which is the source of most of the
saving; a set list that requires many incompatible sorts is more expensive
than it looks.

**The relationship to pivoting.** Lesson 17 turned rows into columns for
one dimension. `GROUPING SETS` produces the *long-form* version of a
cross-tab with all its margins, which is exactly the shape a BI tool or a
dataframe wants to receive. Long form with margins from SQL, rotation in the
presentation layer, is the combination that scales.

## ex1 — revenue per status, with a grand total

The minimal grouping set: `((status), ())`. Note the grand-total row's NULL
status — and that you have to *know* it means "all statuses" rather than
"orders with no status", which is exactly the ambiguity `GROUPING()` exists
to remove.

## ex2 — category totals and status totals in one query

Two independent breakdowns plus the overall, in one pass. Written as three
queries and stitched together, this is three scans of half a million rows
and three chances for the numbers to disagree.

## ex3 — every combination, with CUBE

Thirty-five rows from one clause. Worth checking a property while you are
here: the sum of the category subtotals, the sum of the status subtotals,
and the grand total should all be the same number. When they are not, the
join grain is wrong (lesson 08), and a `CUBE` result is an unusually good
place to notice.

## ex4 — two independent breakdowns in one pass

The case neither shorthand can express, which is why the general form
exists. Notice that the month × status cross-tab is deliberately *absent* —
`GROUPING SETS` lets you ask for exactly the aggregations somebody wants
rather than the full lattice they did not.

## challenge — a category × status hierarchy, labelled

`ROLLUP` plus `GROUPING()` to label the subtotal rows. This is what a
finished report looks like: hierarchical subtotals, a grand total, and
labels a human can read without a footnote explaining what NULL means.

**Course complete.** You have written every query in this course yourself,
against a real database, with an automated gate that showed you its evidence
every time it disagreed with you. That is the loop; it works on any database
and any language, and it is yours now.

## Further reading

- [`GROUPING SETS`, `CUBE`, `ROLLUP`](https://www.postgresql.org/docs/16/queries-table-expressions.html) — the "Table Expressions" chapter's section, with the equivalence to `UNION ALL` spelled out.
- [`GROUPING()`](https://www.postgresql.org/docs/16/functions-aggregate.html) — the grouping operations table, for disambiguating subtotal NULLs.
- [`SELECT` — `GROUP BY`](https://www.postgresql.org/docs/16/sql-select.html) — the full grammar, including how grouping sets combine when you list several.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) — a last pass over `FILTER`, `DISTINCT`, ordered-set aggregates and `string_agg`, all of which compose with grouping sets.
