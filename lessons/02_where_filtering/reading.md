# Reading - 02_where_filtering

`WHERE` is where SQL stops being a data dump and starts being a question.
It is also, measured in production incidents, the most dangerous clause in
the language — not because it is hard, but because a wrong `WHERE` returns
a confident, plausible, wrong answer.

## Notes

**A `WHERE` clause is a per-row predicate.** Conceptually PostgreSQL walks
the rows, evaluates your condition against each one, and keeps the row when
the answer is *true*. Two things follow. First, "true" is doing real work in
that sentence — SQL has three truth values (lesson 05), and a row whose
condition is *unknown* is discarded exactly like a false one, silently.
Second, the walk is conceptual: the planner may use an index to skip most
rows entirely, which is why the same `WHERE` can take 300 ms or 0.3 ms
depending on Part 5.

**`AND` binds tighter than `OR`.** `a OR b AND c` parses as `a OR (b AND c)`.
This is standard, it matches arithmetic (`AND` is the `*`, `OR` is the `+`),
and it is responsible for an enormous number of real bugs, because the wrong
reading is usually *more* rows rather than an error. The habit that
eliminates the whole class: parenthesize every clause that mixes `AND` with
`OR`, even when you are sure. Your reviewer cannot tell "I meant this" from
"I forgot" without the parentheses.

**`BETWEEN` is inclusive on both ends.** `price BETWEEN 100 AND 150` is
`price >= 100 AND price <= 150`. That is fine for integers and prices, and
it is a bug waiting to happen for timestamps: `created_at BETWEEN
'2023-01-01' AND '2023-01-31'` excludes almost all of January 31st, because
the bare date means midnight. The rule professionals use for time ranges is
half-open — `>= start AND < next_start` — and lesson 18 returns to it.

**`LIKE` is not a search engine.** `%` matches any run of characters, `_`
matches exactly one, `ILIKE` is the case-insensitive version, and a leading
`%` means PostgreSQL cannot use an ordinary B-tree index at all — a
`LIKE '%son%'` on a large table is a guaranteed full scan. When you need
real text search, you need `tsvector` and a GIN index, which is lesson 41.
Knowing which of the two you are reaching for is the skill.

**`IN` is `OR` in a smaller box.** `status IN ('paid','shipped')` is exactly
`status = 'paid' OR status = 'shipped'`, with the parenthesization already
correct — which is a quiet argument for preferring it. `IN` also accepts a
subquery (lesson 13), and there its NULL behaviour becomes genuinely
dangerous (lesson 05).

## ex1 — a simple comparison

The first query in this course that reads a large table to return a small
answer. Roughly 25,000 of 500,000 orders survive the filter; the other
475,000 are read and discarded. That ratio — *selectivity* — is the single
number the planner cares most about, and lesson 36 is about how it estimates
it before running anything.

## ex2 — AND, OR, and the parentheses you mean

The precedence trap, deliberately walked into. If you got roughly 83,000
extra rows, you wrote `status = 'paid' AND total < 20 OR total > 1980`, which
PostgreSQL read as `(paid AND cheap) OR (expensive, any status)`. Nothing
warned you, because the query was perfectly valid — it just answered a
different question. This is the shape of most `WHERE` bugs: not an error, a
different question.

## ex3 — pattern matching

`ILIKE '%son%'` reads every one of the 50,000 names. There is no index in the
world that makes a leading-`%` pattern cheap without changing the data
structure — that is what trigram and full-text indexes are for (lesson 41).
Note also that case-insensitivity is not free or universal: `ILIKE` uses the
database's collation rules, and "case" is a much harder question in Turkish
or Greek than the ASCII intuition suggests.

## ex4 — IN and BETWEEN together

Two shorthands in one predicate. Worth noticing: this query has two
independent filters, and the planner will apply whichever it estimates is
cheaper first. When you get to Part 5 and start building composite indexes,
the *order* of the columns in the index will be decided by exactly this kind
of reasoning (lesson 32).

## ex5 — negation done right

Negation is where three-valued logic ambushes people, and this exercise is
deliberately safe: `orders.status` is declared `NOT NULL`, so `<> 'cancelled'`
really does mean "one of the other three". Change one thing — make the column
nullable — and the same query starts dropping every row with a NULL status
without a word of complaint. That is lesson 05, and this exercise is the
before picture.

## ex6 — case matters (until it doesn't)

`LIKE 'A%'` and `ILIKE 'a%'` return the same rows here only because the
generated names are all capitalised. Real customer data is not: people type
their names in lower case, in caps, with leading spaces. Filtering on
user-entered text with `LIKE` and hoping is a recipe for a support ticket;
normalising the data (or indexing `lower(name)` — lesson 40) is the fix.

## challenge — fix the precedence bug

`WHERE status IN ('pending','paid') AND total > 1000` and `WHERE (status =
'pending' OR status = 'paid') AND total > 1000` are the same query. Prefer
the first: it makes the intent obvious and it removes the parenthesis you
could have got wrong. The general lesson is that the best fix for a
precedence bug is usually a rewrite that has no precedence to get wrong.

## review1 — a range inside a category

Two conditions, one of them a `BETWEEN`. When this comes back in three
days, check yourself on the inclusivity of both endpoints before you run it.

The useful habit to rehearse here is prediction: say the row count you
expect out loud, then run it. Being wrong is the information. A filter that
returns ten times what you expected is usually a precedence bug; one that
returns zero is usually a NULL or a typo in a string literal; one that
returns *nearly* the whole table is usually a condition that is true for
almost every row and therefore was not the question anyone meant to ask.

## Further reading

- [Comparison Functions and Operators](https://www.postgresql.org/docs/16/functions-comparison.html) — `BETWEEN`, `IN`, `IS DISTINCT FROM`, and the truth tables that make lesson 05 make sense.
- [Pattern Matching](https://www.postgresql.org/docs/16/functions-matching.html) — `LIKE`, `SIMILAR TO`, and POSIX regexes; note which of them an index can help with.
- [The `WHERE` Clause](https://www.postgresql.org/docs/16/queries-table-expressions.html) — where filtering sits in the logical order of a query's evaluation.
- [Use The Index, Luke — The Where Clause](https://use-the-index-luke.com/sql/where-clause) — the same clause seen from the index's point of view. You will re-read this in Part 5; skimming it now makes Part 5 easier.
