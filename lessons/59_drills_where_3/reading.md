# Reading - 59_drills_where_3

Pattern matching, drilled against text that has real structure - product
names that end in their own id, emails built from a template - because that
is where `LIKE` genuinely belongs.

## Notes

`LIKE` has exactly two metacharacters. **`%` matches any run of characters,
including none; `_` matches exactly one.** Everything else in the pattern is
a literal. `ILIKE` is the case-insensitive variant, and it is a PostgreSQL
extension rather than standard SQL. `NOT LIKE` negates the whole match.

Two consequences worth holding on to. The first is about **anchoring**: a
pattern that begins with a literal (`'Nova %'`) can use an ordinary B-tree
index on that column, while a pattern that begins with `%` cannot, ever - a
leading wildcard forces a full scan no matter what you index. That is why
`LIKE 'user1__@example.com'` is a reasonable production predicate and
`LIKE '%son%'` over a large table is a design smell.

The second is about **precision**: `_` is the tool people forget, and it is
what turns a vague pattern into an exact one. `'user1%@example.com'` matches
customer 1, 10, and 1000; `'user1__@example.com'` matches exactly the
three-digit ids beginning with 1. When the text has a fixed shape, use `_`
and get the shape enforced for free.

## ex1 - an anchored prefix

This tests a left-anchored `LIKE`, the one shape that an ordinary index can
still help with. The classic mistake is dropping the trailing space, which
widens the match to anything merely beginning with those four letters. The
model answer spells the literal out including the space. The reference uses
`left(name, 5)` instead, which is the same test written as a function and is
what an expression index would key on (lesson 40).

## ex2 - a suffix

This tests a right-anchored pattern and quietly makes the indexing point. The
classic mistake is `LIKE '7%'`, which matches names *starting* with 7 - here
that is nothing at all, so you get an empty result and no clue why. The model
answer puts the wildcard first. Because every product name ends in its own
id, this predicate is really "ids ending in 7", which is why it returns a
clean tenth of the catalog.

## ex3 - counting characters with underscore

This tests `_`, the metacharacter everyone forgets, and the difference
between "some characters" and "exactly this many". The classic mistake is
`'user2%@example.com'`, which matches every id beginning with 2 regardless of
length. The model answer uses two underscores to pin the length. The
reference does the same job with a POSIX regex, where `.` is the
single-character wildcard and `%` has no meaning at all.

## ex4 - case-insensitive containment

This tests `ILIKE` against data whose capitalisation you cannot rely on. The
classic mistake is plain `LIKE` with a lower-case literal, which returns zero
rows and looks like missing data rather than a bug. The model answer uses
`ILIKE`. The reference lower-cases the column instead, which is the portable
form and, not coincidentally, the expression you would build an index on if
this predicate ever had to be fast.

## ex5 - excluding a pattern

This tests `NOT LIKE` combined with an ordinary equality. The classic mistake
is negating the wrong half - `category <> 'toys' AND name NOT LIKE '%Doll%'`
reads almost identically and answers a completely different question. The
model answer negates only the pattern. The reference replaces it with
`position(... IN ...) = 0`, which is the function form and makes the "does
not occur anywhere" meaning explicit.

## ex6 - a pattern and a range

This tests combining a pattern with a range, which is the commonest real
`WHERE` clause in existence. The classic mistake is an off-by-one at the
range boundary while all the attention goes to the pattern. The model answer
uses `LIKE` for the text and `BETWEEN` for the number. The reference swaps in
`starts_with` and the expanded comparisons, so you can see that all three
spellings describe the same set of rows.

## ex7 - two patterns and a threshold

This tests precedence again, now with patterns on the `OR` side. The classic
mistake is omitting the brackets, which yields every router in the catalog
regardless of price. The model answer brackets the two `LIKE` tests before
joining the price threshold with `AND`. The reference collapses the
disjunction into one regular expression, which removes the brackets by
removing the `OR` - a trade of familiarity for safety.

## ex8 - a fixed-width pattern and an exclusion

The composite: a fixed-width pattern joined to a negated membership test.
This tests `_` for exact length and `NOT IN` for exclusion in one predicate,
which is a fair interview question because both halves have a well-known
failure mode. The classic mistake is the `<> A OR <> B` exclusion, which
quietly disables the filter. The model answer pins the length with two
underscores and negates the whole country list at once.

## Further reading

- [Pattern Matching](https://www.postgresql.org/docs/16/functions-matching.html) - `LIKE`, `SIMILAR TO` and POSIX regular expressions, with the escape rules for each.
- [String Functions and Operators](https://www.postgresql.org/docs/16/functions-string.html) - `starts_with`, `position`, `left` and `right` - the function forms of several patterns here.
- [Indexes and ORDER BY / operator classes](https://www.postgresql.org/docs/16/indexes-opclass.html) - why a `LIKE` pattern anchored on the left can use an index and a leading `%` cannot.
- [Full Text Search](https://www.postgresql.org/docs/16/textsearch-intro.html) - what to reach for when you catch yourself writing `%word%` against prose.
