# Reading - 41_gin_fulltext

Full-text search is a different data structure, not a cleverer `LIKE`. A
B-tree indexes whole values in order; GIN indexes the *pieces* of a value,
and that inversion is what makes searching a million documents for a word
take milliseconds.

## Notes

**`tsvector` and `tsquery`.** `to_tsvector('english', body)` parses the text
into lexemes, strips stop words, applies the language's stemmer (so
"batteries", "battery" and "batteried" collapse to one lexeme) and records
positions. `to_tsquery` builds the search side with `&`, `|`, `!` and `<->`
(phrase). The `@@` operator asks whether the document matches the query.
Both sides must use the **same text-search configuration** — `'english'` in
one and the default in the other is a silent mismatch that ruins results and
the index.

**GIN is an inverted index.** For every lexeme, it stores the list of rows
containing it. Searching for a word is a direct lookup; combining words is
an intersection of lists. That is the same structure a search engine uses,
and it is why the cost scales with the number of *matches*, not with the
size of the corpus.

**GIN versus GiST for text.** GIN is larger, slower to build and update, and
substantially faster to query — the right default for a corpus that is read
far more than written. GiST is smaller and lossy (it can produce false
positives that must be rechecked), which makes it better for
frequently-updated data. For a review corpus, GIN.

**Index the expression, exactly.** The index is over
`to_tsvector('english', body)` — an expression index (lesson 40) — so the
query's left-hand side must match it character for character, configuration
name included. This is the single most common reason a full-text index goes
unused. The robust alternative is to store the vector in a generated column
(`GENERATED ALWAYS AS (to_tsvector('english', body)) STORED`) and index that
by name, which removes the matching problem entirely.

**Three query-builders, three input sources.** `to_tsquery` for expressions
you wrote — it raises on malformed input. `plainto_tsquery` for arbitrary
user text — it ANDs the words and never raises. `websearch_to_tsquery` for
search-box syntax with quotes, `OR` and `-term`. Passing raw user input to
`to_tsquery` is a reliable way to produce 500s.

**Ranking is not filtering.** `ts_rank` scores the matches; it does not find
them. The index serves the `WHERE`, then ranking runs over the surviving
rows, then `ORDER BY ... LIMIT` picks the top few. Ranking a million rows
would be slow — ranking the two hundred that matched is not.

**`gin_pending_list_limit` and write cost.** GIN buffers new entries in a
pending list and merges them in batches, which keeps inserts fast at the
cost of a slower first query after a burst of writes. `fastupdate` controls
it. Worth knowing when a GIN-indexed table has a spiky write pattern.

**When *not* to use full text.** For substring matching (`LIKE '%son%'`),
what you want is a trigram index from `pg_trgm`, not `tsvector` — full-text
search works on word boundaries and stems, so it will not find "son" inside
"Anderson". Knowing which of the two a requirement calls for is the actual
decision.

## ex1 — index the corpus

The index takes about a minute to build over a million documents, which is
itself informative: GIN build cost is real, and on a live table this is a
`CREATE INDEX CONCURRENTLY` job. Compare the plan before and after — the
`Seq Scan` was recomputing `to_tsvector` on every one of a million rows.

## ex2 — rank the results

Search then rank, in that order. `ts_rank` is a scoring function over the
matches, and the `LIMIT` applies after ranking — so the index does the
expensive part and the ranking touches only what survived.

## ex3 — a query written by a human

`plainto_tsquery` is the function to reach for whenever the text came from
outside your codebase. Try passing `'durable & battery'` through
`to_tsquery` and then through `plainto_tsquery` in the lab: the first
treats the ampersand as an operator, the second as a word to be ignored.
Neither is wrong; they have different jobs.

## ex4 — search-engine syntax

`websearch_to_tsquery` handles the syntax users already know from every
search box on the internet. Note that all three exercises share one index:
the index describes the *corpus*, and the query-builder is just a way of
phrasing a question about it.

## Further reading

- [Full Text Search](https://www.postgresql.org/docs/16/textsearch.html) — the whole chapter. Read the "Controlling Text Search" section for the three query-builders and `ts_rank`.
- [Text Search Indexes](https://www.postgresql.org/docs/16/textsearch-indexes.html) — GIN versus GiST, build cost, and the `fastupdate` behaviour.
- [GIN Indexes](https://www.postgresql.org/docs/16/gin.html) — what an inverted index actually stores, and the pending-list mechanism.
- [`pg_trgm`](https://www.postgresql.org/docs/16/pgtrgm.html) — trigram indexes, for the substring and fuzzy-match cases that full-text search does not cover.
