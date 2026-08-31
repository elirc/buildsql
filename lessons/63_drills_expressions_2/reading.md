# Reading - 63_drills_expressions_2

Text expressions, drilled on data with real structure: names that follow a
template, emails built from an id, product names that carry their own key.

## Notes

The functions in this set divide into three jobs. **Case folding** (`lower`,
`upper`) normalises text so comparisons and slugs behave; it is also
locale-dependent, which is why "the same string in upper case" is a harder
question in Turkish than the ASCII intuition suggests. **Extraction**
(`left`, `right`, `substring`, `split_part`) pulls a piece out; `split_part`
is the one worth memorising, because it takes a delimiter and a
one-based index and returns the empty string rather than NULL when the part
does not exist. **Assembly** (`||`, `concat`, `lpad`) puts the pieces back
together.

Two traps recur. The first is **NULL propagation through `||`**: if any
operand is NULL the whole concatenation is NULL, silently blanking a row that
looked fine in testing. `concat()` differs - it treats NULL as an empty
string - and `coalesce` is how you choose deliberately rather than by
accident.

The second is **`coalesce` and types**. Every argument must be reconcilable
to one type, so `coalesce(manager_id, 'ROOT')` fails: an `integer` and a text
literal have no common type. Casting the column first - `coalesce(manager_id
::text, 'ROOT')` - is the fix, and it forces you to decide what the column
means once it leaves the database.

## ex1 - case folding

The baseline, and the expression a case-insensitive index would be built on
(lesson 40). The classic mistake is confusing case folding with
case-insensitive *comparison*: `lower(name)` changes the data you return,
while `ILIKE` changes how a comparison behaves and leaves the data alone. The
model answer folds the column. Worth remembering that case folding follows
the database collation, so it is not a pure ASCII operation.

## ex2 - a placeholder for the missing manager

This tests `coalesce` together with the type-unification rule that governs
every conditional expression in SQL. The classic mistake is supplying a text
fallback for an integer column and reading the resulting error as a bug in
`coalesce`. The model answer casts the column to `text` before offering the
literal. Doing the cast explicitly is also a design moment: you have just
decided how this column is represented once it leaves the database.

## ex3 - both ends of a string

This tests the two fixed-width extractors and their symmetry. The classic
mistake is reaching for `substring` with hand-computed offsets for the tail,
which is where an off-by-one lives; `right(name, 4)` has no arithmetic to get
wrong. The model answer uses `left` and `right`. The reference does it the
hard way with `substring` and `length` so you can see the offset arithmetic
that `right` is saving you.

## ex4 - splitting a name

This tests `split_part` and its one-based index, and it deliberately runs
against names that do not all have exactly two parts. The classic mistake is
treating field 1 and field 2 as "first name" and "surname" and building a
product feature on it - a title, a middle name or a suffix breaks that
assumption immediately. The model answer returns the split as it is. Naive
name parsing is a genuine source of production embarrassment.

## ex5 - a URL slug

This tests function composition, the first two-step expression in the set.
The classic mistake is arguing the argument order of `replace` - the string
comes first, then what to find, then what to put there - and quietly
producing a slug with the hyphens and spaces swapped. The model answer folds
the case and then replaces. Real slug generation also has to strip
punctuation and collapse runs of separators, which is where regular
expressions earn their place.

## ex6 - pulling the id back out of an email

This tests chaining two extractions, which is what parsing structured text
actually looks like. The classic mistake is running `replace(email, 'user',
'')` over the whole address instead of the local part, which happens to work
on this domain and breaks the moment a domain contains those four letters.
The model answer isolates the local part first and only then strips the
prefix: narrow the string before you edit it.

## ex7 - a corporate email address

This tests assembling four pieces into one string, which is the everyday
shape of display-text work. The classic mistake is a missing or doubled
separator - the result is a valid string, so nothing complains and only
reading the output catches it. The model answer folds each part before
joining. Note the reference's `concat`, which takes any number of arguments
and, unlike `||`, treats a NULL argument as an empty string.

## ex8 - the warehouse SKU

The composite: case folding, fixed-width extraction, a cast, zero padding and
two separators in one expression. This tests whether you can hold a format
specification in your head and reproduce it exactly, which is the whole job
when a downstream system parses your output by position. The classic mistake
is padding before the cast, or padding to the wrong width. The model answer
builds each field independently and joins them last.

## Further reading

- [String Functions and Operators](https://www.postgresql.org/docs/16/functions-string.html) - the whole toolbox: `||`, `concat`, `left`, `right`, `split_part`, `replace`, `lpad`.
- [Conditional Expressions](https://www.postgresql.org/docs/16/functions-conditional.html) - `coalesce`, `nullif` and `greatest`, and the type-unification rule that governs them.
- [Type Conversion](https://www.postgresql.org/docs/16/typeconv.html) - how PostgreSQL picks a common type for the arms of a conditional expression.
- [Character Types](https://www.postgresql.org/docs/16/datatype-character.html) - why `text` is the sensible default and what `char(n)` padding would do to these results.
