# Reading - 49_distinct_on

`DISTINCT ON` is a PostgreSQL extension that solves one problem completely:
**one row per group, chosen by an ordering**. It is not standard SQL, and
for the problem it solves it is shorter and usually faster than anything
that is.

## Notes

**How it reads.** `SELECT DISTINCT ON (expr) ...` keeps the **first** row of
each group of rows sharing the same `expr`, where "first" is decided by the
query's `ORDER BY`. So the shape is always: group key in `DISTINCT ON`,
group key first in `ORDER BY`, then the criterion that decides the winner,
then a tie-break.

**The `ORDER BY` must lead with the `DISTINCT ON` expressions.** PostgreSQL
enforces this and raises an error otherwise, which is a kindness — the
alternative would be silently returning an arbitrary row. Note that this
also means you cannot directly sort the *result* by something else; wrap it
in a subquery or CTE and sort outside, which is what the challenge asks for.

**Always give it a tie-break.** `DISTINCT ON` returns exactly one row per
group, so something decides which — and with no tie-break that something is
whatever the sort happened to produce, which may differ between runs and
between PostgreSQL versions. Add a unique column at the end of the `ORDER
BY` and the answer becomes deterministic.

**Compared with the alternatives.** `row_number() ... WHERE rn = 1` is the
portable version and takes six lines instead of three. `LATERAL` (lesson 48)
generalises to N > 1 and to arbitrary per-group work. `DISTINCT ON` handles
exactly N = 1, in the fewest characters, and with a matching index —
`(group_key, order_key)` — it can be executed as a single ordered index scan
with a `Unique` node on top, which is about as cheap as this question gets.

**The index that makes it fast.** `(customer_id, created_at DESC)` gives the
planner the exact order the query asks for, so there is no `Sort` node and
the `Unique` node just skips duplicates as they stream past. Without such an
index PostgreSQL sorts the whole input first — correct, but the cost of a
sort rather than of a scan.

**Where it shows up.** Latest status per entity, current price per product,
most recent login per user, newest row per key in a change log, the winning
bid per auction. Any question of the form "the *something*-est row per
group" is this construct.

**Portability.** It is PostgreSQL-only. If the query has to run on other
engines too, `row_number()` is the version to write. If it does not, the
brevity is worth having.

## ex1 — the cheapest product in each category

Three lines for a question that took a correlated subquery in lesson 03 and
a windowed CTE in lesson 15. Note the tie-break on `id` in the prompt — the
cheapest product in a category is not unique, and the query has to say what
to do about that.

## ex2 — each department's newest hire

The same shape with a descending criterion. Building the habit of reading
the `ORDER BY` as "group, then winner, then tie-break" makes these
write-once queries.

## ex3 — each customer's first order

Ascending instead of descending, and nothing else changes. Worth pausing on
how small the edit is compared with the equivalent change in a
window-function version, where the direction lives inside an `OVER` clause
that also has to keep its partition in sync.

## ex4 — the best review of each product

The tie-break earns its keep here: with only five possible ratings and
hundreds of reviews per product, the "best" review is massively ambiguous,
and without `id` at the end of the `ORDER BY` you get a different answer on
a different day. That is the failure mode `DISTINCT ON` makes easy to write
and easy to miss.

## challenge — priciest per category, ranked

The restriction from the notes, met head-on: the `ORDER BY` belongs to the
`DISTINCT ON` and cannot also order the output. Wrap it and sort outside.
This is the standard workaround and worth having in your hands.

## Further reading

- [`SELECT` — `DISTINCT ON`](https://www.postgresql.org/docs/16/sql-select.html) — the reference text, including the warning about unpredictable results without a full `ORDER BY`.
- [Window Functions](https://www.postgresql.org/docs/16/functions-window.html) — `row_number()`, the portable equivalent.
- [`LATERAL` Subqueries](https://www.postgresql.org/docs/16/queries-table-expressions.html) — the generalisation to N > 1. Lesson 48.
- [Use The Index, Luke — Top-N Queries](https://use-the-index-luke.com/sql/partial-results/top-n-queries) — the index shape that makes all three approaches fast.
