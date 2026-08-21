# Reading - 40_expression_indexes

An index stores what you tell it to store. Usually that is a column; it can
just as easily be a function of a column — and that one generalisation
rescues an enormous number of queries that "cannot use an index".

## Notes

**The problem it solves.** `WHERE lower(email) = 'a@b.com'` cannot use an
index on `email`, because the index stores `email` and the query asks about
`lower(email)`. They are different values in a different order. An
expression index stores the computed values, sorted, and the query walks
straight to them.

**The expression must match.** PostgreSQL compares the query's expression
against the index's structurally. `lower(email)` matches `lower(email)`.
`upper(email)` does not. `length(name)` does not match `char_length(name)`
even though they are the same function under different names. When an
expression index goes unused, this is the first thing to check.

**Only immutable expressions may be indexed.** An `IMMUTABLE` function
always returns the same output for the same input, forever — which an index
requires, since the stored value must stay correct. `lower()` is immutable.
`now()` is volatile. `date_trunc('day', timestamptz)` is only *stable*,
because the result depends on the session time zone, so it cannot be
indexed — the workaround is `date_trunc('day', ts AT TIME ZONE 'UTC')`,
which pins the zone and becomes immutable. Casting a `timestamptz` to `date`
has the same problem for the same reason.

**Extra cost, in two places.** The expression is evaluated on every insert
and on every update of the underlying column, and again during `ANALYZE`.
An expensive function in an index is an expensive function on your write
path.

**Statistics come for free.** `ANALYZE` collects statistics on the
expression's values, not just the base column's. So an expression index also
teaches the planner how selective `lower(email) = ...` is — occasionally
worth creating for the estimates alone.

**Common real-world uses.** Case-insensitive lookup — `lower(email)`, and
note that a `UNIQUE` index on `lower(email)` enforces case-insensitive
uniqueness, which no plain constraint can. Extracting a key from JSONB.
Indexing a computed prefix — `left(code, 3)`. Full-text search, where
`to_tsvector('english', body)` is the expression (lesson 41). Functional
uniqueness, like `UNIQUE (lower(slug))`.

**The alternative: a generated column.** Since PostgreSQL 12 you can store
the computed value as a `GENERATED ALWAYS AS (...) STORED` column (lesson
24) and index that normally. The trade-off: the generated column consumes
table space and is visible in `SELECT *`, but the query can reference it by
name instead of repeating the expression exactly — which removes the
matching problem entirely. On a team, that predictability is often worth
more than the disk.

## ex1 — the login lookup

The canonical case, and the one whose absence causes real login-latency
incidents. Note also the uniqueness angle: `CREATE UNIQUE INDEX ON
customers (lower(email))` is how you stop `Bob@x.com` and `bob@x.com` both
registering.

## ex2 — index a computed prefix

Lesson 19's text surgery, made fast. The expression is doing real work per
row, so the index is buying you both the sorted order *and* the avoided
computation.

## ex3 — index a computed property

`length(name)` is not a column anybody designed, and indexing it is still
perfectly reasonable when a query needs it. Try `char_length(name) = 30` in
the lab afterwards — same rows, no index — and you will not forget the
exact-match rule.

## ex4 — index inside the JSON

The pattern that makes one JSONB key behave like a proper typed column,
cast and all. Compare it against lesson 42's GIN index: this one is narrow
and precise, serving equality and range on a single key; GIN is broad,
serving containment queries against any key without knowing them in advance.
Real schemas often have both.

## Further reading

- [Indexes on Expressions](https://www.postgresql.org/docs/16/indexes-expressional.html) — the syntax, the double parentheses, and the cost warning.
- [Function Volatility](https://www.postgresql.org/docs/16/xfunc-volatility.html) — `IMMUTABLE` versus `STABLE` versus `VOLATILE`, and why only the first can be indexed.
- [Generated Columns](https://www.postgresql.org/docs/16/ddl-generated-columns.html) — the store-it-instead alternative, with its own trade-offs.
- [JSON Functions and Operators](https://www.postgresql.org/docs/16/functions-json.html) — for ex4's extraction operators; lesson 42 indexes the same column a completely different way.
