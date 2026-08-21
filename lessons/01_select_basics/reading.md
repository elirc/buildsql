# Reading - 01_select_basics

The SELECT list looks like the easy part of SQL and is where a surprising
share of production problems begin: rows nobody reads, shapes nobody
expected, and duplicates nobody asked about.

## Notes

**A query is a description, not a procedure.** `SELECT name, price FROM
products` does not say "open the table, walk it, copy two fields". It says
"the set of (name, price) pairs drawn from products". PostgreSQL's planner is
free to get there by any route it likes — a sequential scan, an index-only
scan, several worker processes in parallel. This is why the same SQL gets
dramatically faster when you add an index in Part 5 without a character of
the query changing.

**`DISTINCT` is about the whole row, not the first column.** This is the one
genuine trap in this lesson. `SELECT DISTINCT country FROM customers`
returns 12 rows. `SELECT DISTINCT country, name FROM customers` returns
almost 50,000 — adding a nearly-unique column to the list destroys the
deduplication, because two rows are duplicates only when *every* selected
value matches. People reach for `DISTINCT` to "fix" a query that returns
unexpected duplicates, add the column they actually needed, and quietly get
the duplicates back.

**`DISTINCT` is never free.** To know that a value is unique, PostgreSQL has
to compare it against everything else — by sorting the whole input, or by
building a hash table of every value it has seen. On the 3,000,000-row
`events` table that is real work for a five-row answer. `DISTINCT` sprinkled
on a query to make a symptom disappear is one of the most common causes of
slow reports, and the usual honest fix is a join written correctly (Part 1)
or a `GROUP BY` that says what you mean (lesson 07).

**Aliases rename, they do not compute.** `AS` attaches a label to the
expression next to it, for the benefit of whoever reads the output. The
gates in this course compare *values*, not labels, so a missing alias never
fails a test — write them anyway. An unaliased `price * 1.2` comes back to
the caller as a column named `?column?`, which is PostgreSQL politely telling
you the query was written for a machine and not a person.

**`LIMIT` without `ORDER BY` is a bug in waiting.** `LIMIT 5` means "stop
after five rows", and *which* five depends on the plan the planner chose
today. It is stable enough in development to look correct and unstable
enough in production to file a ticket about. Lesson 03 fixes this properly.

## ex1 — just two columns

The whole exercise is the discipline of naming what you want. Worth
knowing what you avoided: `products.description` is a paragraph of text per
row, so `SELECT *` here would move roughly an order of magnitude more data
across the wire for a result nobody would use.

## ex2 — a computed, aliased column

`price * 1.2` is evaluated once per row, and its type follows from its
inputs: `numeric * numeric` stays `numeric`, which is why the money stays
exact. Had `price` been `float`, this multiplication would introduce binary
rounding error — the reason `products.price` is `numeric(10,2)` and not
`double precision`. Lesson 24 revisits that choice properly.

## ex3 — DISTINCT

Twelve rows out of fifty thousand. Notice that the answer is a property of
the *data*, not the schema: nothing declares that there are twelve countries,
and a query that assumes there are will break the day a thirteenth appears.

## ex4 — DISTINCT on a big table

The interesting number is the one that is missing. 500,000 orders belong to
about 45,000 distinct customers, and the `customers` table has 50,000 rows —
so roughly 5,000 customers have never ordered anything. Getting from "the
count doesn't match" to "here are their names" is exactly what a `LEFT JOIN`
does, and it is lesson 09.

## ex5 — DISTINCT over three million rows

Five rows out of three million. Every one of those three million rows was
read, hashed, and discarded. Nothing you can write in the SELECT list avoids
that; the only thing that would is a different physical structure, which is
the entire subject of Part 5. Keep the timing you observed here in mind — you
will make queries like this one dramatically faster later.

## ex6 — two computed columns at once

A rep, deliberately. Fluency with the SELECT list — column order, commas,
aliases, expressions mixed with plain columns — is the thing you want to
stop spending attention on, because every remaining lesson assumes it.

One detail worth pausing on: `price * 3` returns `numeric`, the same type as
`price`, so the bulk price is exact to the cent. Multiply by `1.15` instead
and PostgreSQL still keeps it exact, because the literal `1.15` is parsed as
`numeric` rather than as a float. That is a deliberate choice by the
language, and it is the opposite of what most programming languages do with
a bare decimal literal.

## challenge — DISTINCT over a pair

Two lessons collide early. `attributes ->> 'color'` reaches into a JSONB
document and pulls out a value *as text* (lesson 19 covers `->` vs `->>`
properly). More importantly, this is the whole-row rule from the notes,
working *for* you rather than against you: you want combinations, so a pair
in the SELECT list is exactly right.

## review1 — distinct statuses

Four rows. A column with four possible values in half a million rows is a
*low-cardinality* column, and that fact will matter twice more: lesson 07
groups by it, and lesson 39 shows that indexing it naively is usually
pointless.

## Further reading

- [Select Lists](https://www.postgresql.org/docs/16/queries-select-lists.html) — column labels, `*`, and what `AS` actually binds to.
- [`DISTINCT`](https://www.postgresql.org/docs/16/queries-select.html) — the "Table Expressions" chapter's section on removing duplicate rows; note `DISTINCT ON` waiting at the bottom (lesson 49).
- [Numeric Types](https://www.postgresql.org/docs/16/datatype-numeric.html) — why money is `numeric` and never `float`. Read the "Arbitrary Precision Numbers" section.
- [Don't Do This — `SELECT *`](https://wiki.postgresql.org/wiki/Don%27t_Do_This) — short, opinionated, and correct.
