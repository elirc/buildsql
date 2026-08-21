# Reading - 07_group_by_having

`GROUP BY` is the clause that turns a table into a report. It is also where
SQL's evaluation order stops being an academic diagram and starts producing
error messages you have to understand to get past.

## Notes

**The grouping rule, and why it exists.** Every column in the SELECT list
must either appear in `GROUP BY` or sit inside an aggregate. This is not
pedantry: after grouping, a row *is* a group of many original rows, and an
ungrouped column has many values there. There is no sensible answer to
"which name?" so PostgreSQL refuses to invent one. (MySQL historically did
invent one, silently, which produced a decade of wrong reports. Standard SQL
and PostgreSQL make it an error.)

There is one principled exception: if you group by a table's primary key,
PostgreSQL knows every other column of that table is functionally dependent
on it and lets you select them ungrouped. `GROUP BY c.id` therefore permits
`c.name` in the SELECT list — legal, useful, and it surprises people.

**`WHERE` before, `HAVING` after.** The logical order is `FROM` → `WHERE` →
`GROUP BY` → aggregates → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`. So:

- `WHERE` cannot see aggregates (they have not been computed).
- `HAVING` can, and is the only place a `count(*) > 20` filter can go.
- `SELECT` aliases are invented after `WHERE` and `HAVING`, which is why you
  cannot filter on an alias — but `ORDER BY` and `GROUP BY`, which come
  later or are special-cased, *can* see them in PostgreSQL.

**The performance version of the same rule.** A condition that filters *rows*
belongs in `WHERE`, always. Writing `GROUP BY customer_id HAVING status =
'paid'` is not just stylistically wrong — it is illegal here, and where a
variant of it is legal it means aggregating the whole table and discarding
most of the work afterwards. In Part 5 you will read plans where this is
visible as the row count flowing between nodes: the earlier a filter appears
in the plan, the less work everything above it does.

**Grouping by an expression.** `GROUP BY date_trunc('month', created_at)`
groups by a computed value, and the same expression must appear in the
SELECT list for you to see it. This is how every "per month" report in
existence is built. Two practical notes: PostgreSQL lets you write `GROUP BY
1` (the first SELECT-list item) or `GROUP BY tier` (an output alias) as
shorthands — convenient, and the ordinal form is genuinely error-prone when
someone reorders the SELECT list later. And a `GROUP BY` on an expression
cannot use an ordinary index on the underlying column, which is what
expression indexes (lesson 40) are for.

**Groups you cannot see.** `GROUP BY` produces one row per group *that has
at least one row*. A month with no orders does not appear as zero — it
simply does not appear, and a chart drawn from that result silently skips
it. The fix is to generate the full set of periods (`generate_series`) and
`LEFT JOIN` the aggregate onto it, which is a lesson 09 + lesson 18 combination.

**How PostgreSQL actually groups.** Two strategies: `HashAggregate` builds a
hash table keyed by the grouping columns, and `GroupAggregate` requires the
input sorted by the grouping key and walks it. The planner picks based on
estimated group count and `work_mem`. You will see both node types in Part
5, and a `GroupAggregate` fed by an already-sorted index scan is one of the
cheapest shapes in the system.

## ex1 — revenue per status

Four groups, half a million rows. Compare the `paid` row against
`docs/dataset_facts.md` (250,472 orders) — the habit of tying an aggregate
back to a known count is what catches a mis-typed `WHERE` in ten seconds
instead of a week.

There is also a free consistency check available here: the four counts must
sum to 500,000. Whenever a `GROUP BY` partitions a table with no `WHERE`
clause, the group counts have to add up to the row count, and when they do
not it is because a grouping key was NULL and you did not expect it. Adding
up the parts is the cheapest audit in reporting.

## ex2 — the heavy buyers

`HAVING count(*) > 20` is the exercise, and it is worth noticing that this
is not expressible any other way in a single query without a subquery. The
average customer here has about eleven orders, so >20 is a genuine outlier
segment — the shape of nearly every "power user" query you will ever write.

## ex3 — filter the rows, then group them

The `WHERE`/`HAVING` decision made concrete. Try moving `price > 100` into
`HAVING` in the lab: PostgreSQL rejects it, because `price` is neither
grouped nor aggregated. That error message is the grouping rule protecting
you. (`HAVING avg(price) > 100` *is* legal and asks a completely different
question — the average of the group, not the price of a product.)

## ex4 — grouping by an expression

Two grouping keys, one of them computed. Two things to take from it: the
same expression appears in the SELECT list and the `GROUP BY` (or the alias
does), and the result is a small cross-tab that is *tall* — one row per
combination. Lesson 17 turns a result of exactly this shape sideways into
columns, which is what a human actually wants to look at. Lesson 50 shows
how to get subtotals per category and a grand total in the same pass.

## challenge — monthly revenue

`date_trunc('month', created_at)` maps every timestamp in a month to the
month's first instant, so grouping by it groups by month. Thirteen rows,
because the data spans 2022-11-14 to 2023-11-14 — two partial months at the
ends. Partial periods at the boundaries of a time series are a permanent
feature of real reporting, and reports that do not label them mislead people
who read the first and last bars of the chart.

## review1 — products per category

The simplest possible `GROUP BY`, brought back deliberately. When it
reappears, write it without looking, then check the six category counts
against `docs/dataset_facts.md`.

Two questions to ask yourself while it runs. Do the six counts sum to
10,000? And would a seventh category with zero products appear in this
result? (No — `GROUP BY` invents nothing, so a category with no rows simply
does not exist as far as this query is concerned. That is the gap you have
to fill with a lookup table and a `LEFT JOIN` when the categories are a
fixed list that must always be shown.)

## Further reading

- [`GROUP BY` and `HAVING`](https://www.postgresql.org/docs/16/queries-table-expressions.html) — the "Table Expressions" chapter, sections 7.2.3 and 7.2.4. Read the functional-dependency paragraph about grouping by a primary key.
- [`SELECT` — the `GROUP BY` clause](https://www.postgresql.org/docs/16/sql-select.html) — including `GROUP BY` ordinals, output aliases, and a first look at `GROUPING SETS` (lesson 50).
- [`date_trunc` and date/time functions](https://www.postgresql.org/docs/16/functions-datetime.html) — the toolkit behind every per-period report. Preview of lesson 18.
- [Use The Index, Luke — Grouping](https://use-the-index-luke.com/sql/sorting-grouping) — how an index can turn a hash aggregate into a pipelined group aggregate, and why that matters for `LIMIT`.
