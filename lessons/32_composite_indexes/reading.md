# Reading - 32_composite_indexes

A composite index is a sorted copy of *several* columns — sorted by the
first, then by the second within ties on the first, and so on. Every rule
about composite indexes falls straight out of that sentence, so it is worth
holding onto literally: think of a phone book sorted by (last name, first
name).

## Notes

**Column order is the design.** `(a, b)` and `(b, a)` are different indexes
with different capabilities. The phone book sorted by (last, first) answers
"everyone called Smith" and "Smith, John" instantly, and is useless for
"everyone called John".

**Equality columns first, range column last.** A B-tree can narrow on
consecutive leading columns as long as each one is pinned to a single value.
The moment a column is used for a range (`>=`, `<`, `BETWEEN`, `LIKE 'x%'`),
the entries after it are spread across the whole matched range and no later
column is in a usable order for filtering. So an index on `(product_id,
rating)` serves `product_id = 42 AND rating >= 4` beautifully, and
`(rating, product_id)` does not. Exactly one range column can be used, and
it must be last.

**Sort columns come after that.** If the query also has an `ORDER BY`, the
sort columns belong after the equality columns and — usually — instead of
the range. `WHERE customer_id = 7 ORDER BY created_at DESC` wants
`(customer_id, created_at)`. That is lesson 35.

**Lead with the selective column, all else equal.** When two conditions are
both equalities, either order finds the rows, but the more selective column
first means the tree narrows faster and fewer index pages are touched. The
exception, and it is a common one: if another query in your application
filters on the *less* selective column alone, leading with it may let one
index serve both queries. Index design is a portfolio decision, not a
per-query one.

**One good composite beats several single-column indexes.** PostgreSQL
*can* combine separate indexes via a bitmap AND (lesson 38), and it is much
worse than a composite: it scans both indexes fully, builds two bitmaps and
intersects them, where a composite index walks straight to the answer. Two
single-column indexes are a reasonable hedge when you do not know the query
mix; a composite is the answer when you do.

**Every prefix is free.** An index on `(a, b, c)` also serves queries on
`(a, b)` and on `(a)` alone — the same structure, stopping earlier. So
`(a, b, c)` makes a separate index on `(a)` redundant, and dropping the
redundant one saves write amplification and disk. This is the "left prefix
rule", and lesson 33 is entirely about the half of it that surprises people.

**Width has a cost.** Each extra column makes every index entry bigger,
which means fewer entries per page, more pages, more I/O, and a bigger
write penalty on every update. Adding a column "just in case" is not free —
though `INCLUDE` (lesson 34) is a cheaper way to carry payload columns that
are never searched.

## ex1 — two equalities

Both column orders work; one is better. Build the other one in the lab and
compare `EXPLAIN (ANALYZE, BUFFERS)` — the row counts are identical and the
buffer counts are not, which is exactly the kind of difference that timing
alone can hide on a warm cache.

## ex2 — equality then range

The rule that matters most, felt directly. If you built it the other way
round first and watched the plan get slower, that is the lesson landing.

## ex3 — two equalities on the line items

A rep on a bigger table, with a large selectivity gap between the two
columns: `product_id` has 10,000 distinct values and `quantity` has five.
Leading with `quantity` still *works* — the gate would pass — and it does
several hundred times more index work to get there.

## ex4 — equality first, range second

The same rule as ex2, on different data, because this is the one to have in
your hands rather than in your notes. When you are asked to design an index
for a query, the algorithm is mechanical: list the equality columns, then
the range column, then the `ORDER BY` columns, and stop at the first range.

## Further reading

- [Multicolumn Indexes](https://www.postgresql.org/docs/16/indexes-multicolumn.html) — the official statement of the prefix rule, and the note on when PostgreSQL will use a non-leading column anyway (badly).
- [Combining Multiple Indexes](https://www.postgresql.org/docs/16/indexes-bitmap-scans.html) — what happens when you have two single-column indexes instead of one composite. Lesson 38.
- [Use The Index, Luke — Concatenated Keys](https://use-the-index-luke.com/sql/where-clause/the-equals-operator/concatenated-keys) — the phone-book explanation, with diagrams. Read this one.
- [Use The Index, Luke — Ranges](https://use-the-index-luke.com/sql/where-clause/searching-for-ranges) — why exactly one range column can be used, and why it must be last.
