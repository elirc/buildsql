# Reading - 104_drills_jsonb_1

Eight drills on reading, expanding and building `jsonb` documents. Read
after your attempt, pass or fail.

## Notes

`jsonb` is a parsed, binary representation: keys are deduplicated and
reordered, whitespace is gone, and lookups are fast - unlike `json`, which
stores the original text and reparses it every time you touch it. Store
`jsonb` unless you need the source bytes back verbatim. The access operators
come in pairs, and the rule is mechanical: the single-arrow forms `->` and
`#>` return `jsonb`, so they chain and can be compared to other documents;
the double-arrow forms `->>` and `#>>` return `text`, so they end a chain
and are what you compare to strings, cast to numbers, or group by. Two
different questions hide behind similar-looking operators, too: `?` asks
whether a *key* exists in an object or a *string element* exists in an
array, while `@>` asks whether one document contains another, which is the
one a GIN index supports best. And when a document has to become rows, the
expanders (`jsonb_each`, `jsonb_each_text`, `jsonb_array_elements`,
`jsonb_array_elements_text`) are set-returning functions, so they belong in
`FROM`, usually behind a `LATERAL`.

## ex1 - two fields, two shapes

What this tested: the arrow pair and one array function. `attributes ->>
'size'` yields text; had you written `->` the column would be a JSON string
including its quotes, which prints almost identically and compares
differently - a bug that survives a casual eyeball. `jsonb_array_length`
saves you from expanding the array just to count it.

## ex2 - a census on a document field

What this tested: grouping by a document field, which is exactly like
grouping by any other expression once `->>` has produced text. The classic
mistake is `GROUP BY attributes -> 'size'`, which groups the JSON values -
it happens to give the same four groups here, but the labels come back
quoted and the type is wrong for anything downstream. Four sizes is the
check.

## ex3 - reaching in by path

What this tested: `#>` and `#>>`, which take an array of path steps and walk
them - `'{tags,0}'` means "the `tags` key, then element 0". They matter as
soon as documents nest, because `a -> 'b' -> 'c' ->> 'd'` becomes a path in
one operator. Array indexing is 0-based here, unlike SQL arrays, which are
1-based: the two conventions sit side by side in the same query and the
mismatch is a genuine source of bugs.

## ex4 - does the array contain it

What this tested: `?` on an array, which tests for a string *element*, not
for a key - the same operator does both jobs depending on what is to its
left. The reference uses containment, `attributes @> '{"tags":["premium"]}'`,
which is the form a GIN index on the whole column accelerates; `?` is
supported by the default GIN operator class too, but only when applied to
the indexed column itself, not to an expression of it. The classic mistake
is `attributes ->> 'tags' LIKE '%premium%'`, which treats a document as a
string and will happily match a tag called `premium-refurbished`.

## ex5 - the document as rows

What this tested: expanding an object into key/value rows, and the `-`
operator that removes a key from a document before you do. Both are worth
knowing: `jsonb_each_text` is the generic way to inspect documents whose
shape you do not know in advance, and `attributes - 'tags'` is the tidiest
way to say "everything except". The classic mistake is calling a
set-returning function in the SELECT list; it works in PostgreSQL, but
`CROSS JOIN LATERAL` in `FROM` is what other people can read.

## ex6 - build a document

What this tested: construction rather than extraction. `jsonb_build_object`
takes alternating keys and values and infers each value's JSON type - the
numeric price becomes a JSON number, not a string, which is the detail the
gate checks. The reference builds the same object with `to_jsonb` over a
one-row subquery, which is the trick for turning a whole record into a
document without naming every key twice.

## ex7 - a JSON array per group

What this tested: `jsonb_agg`, an ordinary aggregate that happens to produce
a document - and, like `string_agg`, one that takes its own `ORDER BY`
inside the call. Without it the array's element order is whatever the
aggregation produced, which is unstable between runs and therefore untestable.
Aggregating into JSON is how a report hands a nested result to an
application in one round trip instead of N.

## ex8 - a pivot over a document field

What this tested: everything at once - a document field as the grouping key,
an existence test inside a `FILTER`, and a ratio over two aggregates. Note
that `count(*) FILTER (WHERE attributes -> 'tags' ? 'sale')` reads a
document twice per row and cannot use an index for the filter, which is
fine at ten thousand rows and would not be at ten million; that is the point
at which the tag would be promoted to a real column or an expression index.
The classic mistake remains integer division - keep the `100.0`.

## Further reading

- [JSON Types](https://www.postgresql.org/docs/16/datatype-json.html) - `json` against `jsonb`, and what jsonb normalises away.
- [JSON Functions and Operators](https://www.postgresql.org/docs/16/functions-json.html) - the full operator table (`->`, `->>`, `#>`, `#>>`, `?`, `@>`, `-`) and the expanders and builders.
- [jsonb Indexing](https://www.postgresql.org/docs/16/datatype-json.html#JSON-INDEXING) - which operators a GIN index can serve, and the `jsonb_path_ops` opclass.
- [Set Returning Functions](https://www.postgresql.org/docs/16/functions-srf.html) - why `jsonb_each` and friends belong in `FROM`.
