# Reading - 19_text_jsonb

Text and JSONB are the two column types that carry structure *inside* the
value. Everything in this lesson is about reaching into that structure
correctly — and every performance consequence of doing so is deferred to
lessons 40 to 42, which is worth remembering while you write queries that
read entire tables today.

## Notes

**JSONB versus JSON.** `json` stores the exact text you inserted, including
whitespace, key order and duplicate keys. `jsonb` parses into a binary form:
keys are sorted, duplicates collapse to the last one, whitespace is gone,
and — the part that matters — it can be indexed and queried with operators.
Use `jsonb` unless you specifically need to preserve the original document
byte for byte.

**`->` versus `->>`.** `->` returns JSONB; `->>` returns text. Chain `->` to
navigate (`payload -> 'user' -> 'address'`) and finish with `->>` when you
want a value SQL can compare (`->> 'city'`). The classic bug is
`attributes -> 'color' = 'red'`, which fails because JSONB is not text; the
classic *silent* bug is comparing extracted text numerically without
casting, because `'996' < '99'` is true in text ordering. Always cast:
`(payload ->> 'value')::int`.

**Containment `@>` is the idiomatic shape test.** `attributes @> '{"color":
"red"}'` asks whether the left document contains the right one, at any
depth, including inside arrays: `@> '{"tags": ["eco"]}'` means "tags contains
eco". It reads well, it handles nesting, and — the reason it dominates real
JSONB code — it is the operator a GIN index accelerates (lesson 42). Get in
the habit of expressing JSONB predicates as containment where you can.

**Other operators worth knowing.** `?` tests whether a key exists;
`?|` and `?&` do "any of" and "all of" over an array of keys; `#>` and `#>>`
take a path array (`attributes #>> '{tags,0}'`); `jsonb_path_query` and the
`@@`/`@?` operators implement the SQL/JSON path language for anything more
complicated. `jsonb_array_elements_text(...)` turns an array into rows,
which is how you group by array element.

**Text: know which tool you are reaching for.** `split_part` for fixed
delimiters, `position` and `substring` for offsets, `~` and `~*` for regular
expressions, `regexp_replace` for rewriting, `format()` for building strings
safely. The difference that catches people is what each returns on a
non-match: `split_part` gives an empty string, `substring` with a regex
gives NULL, and `position` gives 0. Three different "not found" values in
one toolbox.

**Empty string is not NULL.** In PostgreSQL — unlike Oracle — `''` is a
real, non-NULL value. So `split_part` returning `''` will pass an
`IS NOT NULL` test and fail a "did we find anything" test written that way.
`nullif(split_part(...), '')` converts one into the other when you want NULL
semantics.

**`LIKE`, regex, and real search are three different things.** `LIKE
'%son%'` and `~ 'son'` both read every row: a B-tree cannot help a pattern
that does not anchor at the start. For substring search at scale you need a
trigram index (`pg_trgm`); for word-based search you need `tsvector` and GIN
(lesson 41). Knowing which of the three a requirement calls for — prefix
match, substring match, or linguistic search — is the actual decision.

**The design question JSONB always raises.** JSONB earns its place for
genuinely variable attributes: merchandising tags, third-party webhook
payloads, form submissions. It gets abused as schema avoidance — whole
orders stored as documents, queried through `->>` chains that no constraint
protects, no type checks, and no index helps. The smell test, which lesson
26 formalises: *if you know the keys in advance and query them constantly,
they are columns.* If they vary per row and you mostly store and fetch
whole, JSONB is honest. `products.attributes` in this database is a fair
use; `orders` as a document would not be.

## ex1 — usernames

`split_part(email, '@', 1)`. Trivial on generated data and a minefield on
real data, where an email column contains leading spaces, capitals,
plus-addressing and the occasional two `@` signs. Parsing user-entered text
is always more forgiving in the query than the data deserves.

## ex2 — red XL hunting

Two `->>` comparisons, or one `@>` with a two-key document. Both are
correct; only one of them can use a GIN index, which you will discover in
lesson 42. Writing it both ways now means the lesson-42 comparison lands on
a query you already understand.

## ex3 — tagged eco

Containment against an array. `@> '{"tags": ["eco"]}'` does not mean "tags
equals \[eco\]" — it means "tags contains eco among possibly other
elements", which is exactly the semantics a tag filter wants. This query
reads all 10,000 products today and will read almost none of them after
lesson 42.

## ex4 — the first word

A small function with a specific "not found" behaviour. The broader point:
deriving a value from text in the query means every consumer agrees on the
definition — but it also means no index can help unless you build an
expression index on the same expression (lesson 40).

## ex5 — arrow versus double arrow

The two operators, side by side, with their types visible. Once you have
seen `tags_json` come back as a JSON array and `color_text` as a bare
string, the rule "navigate with `->`, land with `->>`" stops needing to be
memorised.

## ex6 — the colour census

`GROUP BY` on a JSONB accessor — lesson 07's grouping-by-expression with a
new kind of expression. Note the honest performance footnote in the prompt:
this reads the whole table, and no index you can create with what you know
today changes that. Hold onto that; lesson 40 gives you the expression index
that does.

## challenge — the tag census

`jsonb_array_elements_text` is a *set-returning function*: one input row
becomes several output rows, which means the product row is duplicated once
per tag. That is a deliberate fan-out and it is safe here because you are
counting tags, not products. Put a `sum(price)` in that query instead and
you would double every product's price — the grain problem from lesson 08,
arriving from an unexpected direction.

## review1 — high-value purchases

The cast is the exercise. `payload ->> 'value'` is text, and comparing text
to `995` either errors or — worse, in some formulations — compares
lexicographically, where `'996' < '99'`. `(payload ->> 'value')::int > 995`
is the correct form, and it is also a function of a column, so remember it
when lesson 40 asks you for an expression to index.

## Further reading

- [JSON Types](https://www.postgresql.org/docs/16/datatype-json.html) — `json` versus `jsonb`, the containment semantics, and the indexing section that lesson 42 builds on.
- [JSON Functions and Operators](https://www.postgresql.org/docs/16/functions-json.html) — `->`, `->>`, `#>`, `@>`, `?`, `jsonb_array_elements_text`, and the SQL/JSON path language.
- [String Functions and Operators](https://www.postgresql.org/docs/16/functions-string.html) — `split_part`, `position`, `substring`, `format`, and the regex family.
- [Pattern Matching](https://www.postgresql.org/docs/16/functions-matching.html) — `LIKE`, `SIMILAR TO`, POSIX regexes, and the note on which of them an index can serve.
