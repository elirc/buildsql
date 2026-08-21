# Reading - 33_left_prefix

The left-prefix rule is the single most load-bearing fact about B-tree
indexes, and the one that costs the most time when it is not known: an index
on `(a, b)` helps a query on `a`, and does nothing useful for a query on `b`
alone.

## Notes

**Why it is true.** The index is sorted by `a` first, then by `b` within
equal `a`. Look up `a = 7` and the entries are contiguous — one descent of
the tree. Look up `b = 'purchase'` and the matching entries are scattered
through the whole index, once inside every distinct `a`. There is no
shortcut; the structure simply is not sorted the way that query needs.

**The phone book.** Sorted by (last name, first name). "Everyone called
Smith" — one page range. "Smith, John" — one entry. "Everyone called John" —
read the whole book. The rule is not a PostgreSQL quirk; it is what sorted
order means.

**Every prefix is free; no suffix is.** An index on `(a, b, c)` serves
`(a)`, `(a, b)` and `(a, b, c)`. It does not serve `(b)`, `(c)` or
`(b, c)`. So a separate index on `(a)` alongside `(a, b)` is redundant and
should be dropped — it costs write amplification and disk for nothing. Two
practical habits follow: audit for redundant prefixes when you inherit a
schema, and when you need both `(a, b)` and `(b, a)`, accept that you need
two indexes.

**PostgreSQL can misuse a non-leading column, and it is not a rescue.** The
planner may choose an index scan that filters on a trailing column while
scanning the *entire* index, when the index is much narrower than the table.
You will see this as an `Index Scan` with a huge `actual rows` on the index
and a small final count. It is not the prefix rule being broken; it is a
full scan of a smaller structure.

**Foreign keys are the reason this bites in production.** PostgreSQL does
not index foreign-key columns. So the join column your application uses
hundreds of times a second is unindexed until somebody notices — and worse,
`DELETE FROM parent` has to scan the entire child table for references,
which turns a one-row delete into a sequential scan of a million rows. Every
foreign key that is ever used in a join or a cascading delete wants an
index; that is close to all of them.

**Designing the order.** List the query's equality columns, then its range
column, then its `ORDER BY` columns. That ordering is the index. When
several queries compete, prefer the column order that lets one index serve
the most of them via prefixes — a `(customer_id, created_at)` index serves
"one customer's orders", "one customer's recent orders" and "one customer's
orders sorted by date", which is three query shapes for one index.

## ex1 — index the FK

The receipt query from lesson 08, made fast by the index PostgreSQL refused
to create for you. This is the most common missing index in the world.

## ex2 — the prefix rule, felt

The composite is pre-filled and the query filters the *trailing* column.
The gate insists on a `Seq Scan`, which is the plan being honest: the index
exists, it is on the right table, it contains the column, and it cannot
help. An index is not a general-purpose speed-up; it is a specific sorted
order.

## ex3 — the whole key

Both columns pinned to values, so the tree narrows on both in one descent.
Three million rows down to a handful. Note the column order argument in the
prompt — `customer_id` first is not arbitrary, it is the selective column,
and leading with `event_type` would narrow to 230,000 entries before doing
any real work.

## ex4 — half the key is still a key

The same index, a query on the leading column only, and it works. Having
seen both halves — ex2 fails, ex4 succeeds, same index — the rule should now
be something you can state without hedging: **leading columns, in order,
without gaps.**

## Further reading

- [Multicolumn Indexes](https://www.postgresql.org/docs/16/indexes-multicolumn.html) — the prefix rule as the manual states it, including when a non-leading column is used anyway.
- [Use The Index, Luke — Concatenated Keys](https://use-the-index-luke.com/sql/where-clause/the-equals-operator/concatenated-keys) — the definitive treatment, with the phone-book analogy and the redundant-index argument.
- [`ALTER TABLE ... ADD FOREIGN KEY`](https://www.postgresql.org/docs/16/sql-altertable.html) — and the manual's note that an index on the referencing column is *not* created automatically.
- [Index maintenance](https://www.postgresql.org/docs/16/monitoring-stats.html) — `pg_stat_user_indexes` for finding both the unused indexes and the redundant prefixes.
