# Reading - 105_drills_jsonb_2

Eight drills applying lesson 19's JSONB operators to the clickstream and the
catalogue. Read after your attempt, pass or fail.

## Notes

Three operations cover almost all read-side JSONB work, and this set uses
each where it is strongest. Extraction (`->` to stay in JSONB, `->>` to step
out to text) feeds SQL that wants a scalar; containment (`@>`) asks whether a
document has a shape, and is the operator a GIN index accelerates in lesson
42; expansion (`jsonb_array_elements_text`) turns an array into rows so the
relational machinery - GROUP BY, JOIN, window functions - can take over. The
recurring trap is the type at each boundary: `->>` always hands you text, so
every number needs a cast before it is compared, averaged, or joined on, and
every JSONB-to-JSONB comparison needs the JSON quoting rules respected. When
a query on a document column goes wrong, check the boundary first.

## ex1

A warm-up on the extraction boundary: `path` had to come out as text, which
is `->>`. What it was really testing is whether you reach for the right
arrow without thinking. The classic mistake is `-> 'path'`, which returns a
JSONB string - it renders with quotation marks and compares unequal to every
text value. The model answer is one `->>` and nothing else; the reference
spells it `jsonb_extract_path_text` to show the functional form exists.

## ex2

This one chains two toolboxes: JSONB extraction hands you `/p/1234` and the
string functions take over. The classic mistake is stopping at
`split_part(...)` and returning text - the gate compares typed values, and
`'1234'` is not `1234`. The model reasoning: split on `/`, remember
`split_part` counts fields 1-based with an empty first field (the path
starts with the delimiter), so the id is field 3, then cast.

## ex3

Containment as a predicate. `payload @> '{"value": 1000}'` reads "the
payload contains a value key equal to 1000" and matches numbers as numbers -
no cast, no text comparison. The classic mistake is quoting the number
(`{"value": "1000"}`), which matches nothing because JSON strings and JSON
numbers never compare equal. The reference shows the extract-and-cast
version; both are correct, and lesson 42 explains why the containment form
becomes the fast one once a GIN index exists.

## ex4

An ordinary grouped average with a type boundary in the middle. What it
tested: extracting the measure (`->> 'value'`), casting it, and aggregating
- in that order. The classic mistake is `avg(payload ->> 'value')`, which
errors because text has no average, or casting after aggregating, which
never parses. The model answer groups by `event_type` and averages the cast
value; the round-to-one-decimal is presentation, applied last.

## ex5

Expansion followed by aggregation: once `jsonb_array_elements_text` has
turned each two-tag array into two rows, the query is lesson 07's grouped
report. The subtle point being tested is that a set-returning function in
FROM already sees the table's columns - implicit LATERAL - so no keyword is
needed. The classic mistake is trying to GROUP BY the array itself, which
groups by the pair rather than by each tag. The reference exploits this
dataset's fixed shape (exactly two elements) with a UNION ALL of `->> 0` and
`->> 1` - correct here, brittle anywhere arrays vary in length.

## ex6

A histogram whose bucket key is arithmetic on an extracted document value:
cast first, integer-divide second, group by the whole expression. What it
tested: lesson 07's group-by-a-computed-value with a JSONB accessor and a
cast folded into the expression, plus two measures at different grains
(events and distinct customers) sharing one pass. The classic mistake is
dividing before casting - text has no division - or grouping by a rounded
float instead of integer division, which produces band edges that drift.
The model reasoning: make the bucket function total and cheap, then the
histogram is just GROUP BY it.

## ex7

The join key is computed. Parsing `product_id` out of the path and joining
it to `products` tests whether you will put an expression in a join
condition - beginners often materialise a temp-table-like CTE first, which
the reference does deliberately to show it reads well too. The classic
mistake is forgetting the cast, joining text to int, and reading an operator
error. Second lesson inside: view counts per product are tightly clustered,
so the ten-row cut needs the `product_id` tie-break to be a well-defined
set - the same determinism rule every top-N in this course has drilled.

## ex8

The senior version of expansion: a self-pairing. Expanding the same array
twice produces every ordered combination per product, and `a.tag < b.tag`
keeps exactly one representative of each unordered pair - the standard
dedupe-a-cross-product trick, the same one lesson 79's teammate-pairs drill
used on rows. The classic mistake is `!=` instead of `<`, which double
counts every pair. The reference solves it without any expansion at all -
`least`/`greatest` of the two elements - which works only because every
array here has exactly two distinct elements, and knowing when a shortcut's
precondition holds is the actual skill being tested.

## Further reading

- [JSON Types](https://www.postgresql.org/docs/16/datatype-json.html) - the jsonb type, and section 8.14.3 on containment semantics.
- [JSON Functions and Operators](https://www.postgresql.org/docs/16/functions-json.html) - `->`, `->>`, `@>`, `jsonb_array_elements_text`, and friends.
- [String Functions](https://www.postgresql.org/docs/16/functions-string.html) - `split_part`, `substring`, `substr` for path surgery.
- [GIN Indexes](https://www.postgresql.org/docs/16/gin-intro.html) - why the containment operator is the one to prefer once lesson 42's indexes exist.
