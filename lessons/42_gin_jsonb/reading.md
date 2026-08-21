# Reading - 42_gin_jsonb

JSONB's containment operator and GIN were designed for each other. Together
they let a document column be queried at speed without giving up the
flexibility that made you choose a document column in the first place.

## Notes

**Why `@>` is the operator to build around.** `attributes @> '{"color":
"red"}'` asks whether the left document contains the right one — at any
depth, and inside arrays, so `@> '{"tags": ["eco"]}'` means "tags includes
eco". It is one operator that expresses most of what people want from a
document column, and it is the one GIN accelerates. Expressing JSONB
predicates as containment rather than as `->>` comparisons is the habit that
makes them indexable.

**A GIN index over JSONB indexes the contents, not the value.** For each
document it extracts keys and values and records which rows contain each
one. Querying is then an intersection of posting lists. Crucially, you did
not have to name the keys at index-creation time — which is what makes it
work for documents whose shape varies by row.

**Two operator classes.** `jsonb_ops` (the default) indexes every key and
every value separately, supporting `@>`, `?`, `?|`, `?&` and the path
operators. `jsonb_path_ops` indexes hashes of complete paths, supporting
only `@>` — and is typically several times smaller and faster for it. Use
`jsonb_path_ops` when containment is all you need, which is most of the
time.

**GIN versus an expression index.** Lesson 40's `CREATE INDEX ON events
((payload ->> 'value')::int)` is narrow and precise: one key, stored as a
proper type, serving equality *and ranges* and *ordering*. A GIN index is
broad: any key, containment only, no ranges, no ordering. They are
complementary, and real schemas frequently have both — a GIN index for the
open-ended queries and a B-tree on the two keys that are queried
constantly.

**GIN cannot do ranges or ordering.** `WHERE (payload ->> 'value')::int >
500` gets nothing from a GIN index no matter how it is written, because the
index stores an unordered inverted list. If you need ranges on a key, you
need a B-tree on the extracted expression.

**Cost.** A GIN index over a document column is large — often a significant
fraction of the table — and slower to update than a B-tree, because one row
change touches many posting lists. The pending-list mechanism
(`fastupdate`) softens the write cost and adds a first-query penalty after
a burst of inserts.

**The design question does not go away.** Indexing JSONB well makes it
*fast*; it does not make it *typed*. There is still no constraint stopping a
row from storing `"color": 5`, no foreign key on a tag, and no error when a
key is misspelled on write. Lesson 19's smell test stands: keys you know in
advance and query constantly are columns.

## ex1 — tag containment

Array containment, which is the case people most often assume they need a
separate table for. Note the query is unchanged from lesson 19 — the index
changed what it costs, not what it means.

## ex2 — needle in the clickstream

Three million documents, and the GIN index turns a full scan into a posting-
list lookup. Check the index's size with
`pg_size_pretty(pg_relation_size('...'))` and compare it against the table;
that ratio is the price of the generality.

## ex3 — two keys at once

One containment test, two keys, and — the part worth noticing — an index
that was built without knowing which keys would be queried. Try a
combination the exercise never mentions in the lab; it is fast too.

## ex4 — the smaller operator class

The operator-class decision, made explicitly. Build both versions in the lab
and compare `pg_relation_size` — `jsonb_path_ops` is usually a good deal
smaller. Then try a `?` key-existence query against it and watch it go
unused: you traded operators for size, deliberately.

## Further reading

- [JSON Types — `jsonb` Indexing](https://www.postgresql.org/docs/16/datatype-json.html) — the containment semantics and the two operator classes, with size comparisons.
- [JSON Functions and Operators](https://www.postgresql.org/docs/16/functions-json.html) — `@>`, `?`, `#>`, and the SQL/JSON path operators `@?` and `@@`.
- [GIN Indexes](https://www.postgresql.org/docs/16/gin.html) — the inverted-index internals, operator classes, and `fastupdate`.
- [Indexes on Expressions](https://www.postgresql.org/docs/16/indexes-expressional.html) — the complementary approach from lesson 40; most real schemas want both.
