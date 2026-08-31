# Reading - 102_drills_text_1

Eight drills on the string functions you reach for daily. Read after your
attempt, pass or fail.

## Notes

The text functions divide into four jobs, and knowing which job you are
doing usually picks the function for you. Measuring and locating -
`length`, `position` - give you numbers, and every one of them is 1-based,
which is the single most common off-by-one in SQL for anyone arriving from a
0-based language. Slicing - `left`, `right`, `substring`, `split_part` -
takes those numbers and returns parts. Assembling - `||`, `concat`,
`format`, `string_agg` - goes the other way, and the important difference is
NULL handling: `'a' || NULL` is NULL, while `concat('a', NULL)` is `'a'`, so
the operator is honest and the function is convenient. Formatting -
`to_char`, `lpad`, `rpad` - is about the shape of the output rather than its
content, and belongs at the very end of a pipeline, never in a grouping key.
One quiet trap runs through all four: `length` counts characters, not bytes,
and on a UTF-8 database that is the number you want but not the number a
`varchar(n)` limit or a byte-oriented API is talking about.

## ex1 - measure and shout

What this tested: the two most basic operations, and the fact that
`length()` and `char_length()` are the same function in PostgreSQL. Neither
is `octet_length`, which counts bytes and differs for any non-ASCII text -
a distinction that costs nothing to know now and saves an afternoon later.
`upper()` is locale-aware, so it is not merely an ASCII arithmetic trick.

## ex2 - tidy and pad

What this tested: `initcap`, which capitalises the first letter of every
word and lower-cases the rest - so `initcap(lower(x))` and `initcap(x)` are
the same thing, and `initcap` is not a safe way to normalise names like
`McDonald`. `rpad(name, 30, '.')` both pads *and truncates* to exactly 30
characters, which is what "fixed width" means and is the classic surprise:
a longer value comes back cut, not overflowing.

## ex3 - find the marker

What this tested: `position(substring IN string)`, which returns a 1-based
index and 0 when the substring is absent - not NULL, which matters when you
subtract from it. The domain length is `length(email) - at_pos`, and it is
worth checking that arithmetic on one example rather than trusting it:
off-by-one here is invisible until somebody reads the output.

## ex4 - one line per product

What this tested: `format()`, the printf of SQL, against manual `||`
concatenation. `format` reads better when there are several pieces and does
not vanish when one of them is NULL, and `%s` casts each argument to text
automatically - which is why the numeric price needs no explicit cast. The
classic mistake with `||` is forgetting that any NULL operand annihilates
the whole expression.

## ex5 - a list in a cell

What this tested: `string_agg`, the aggregate that concatenates instead of
counting - and the fact that it takes its own `ORDER BY` inside the call.
Without that ordering the result is whatever order the rows happened to
arrive in, which makes the output unstable between runs and untestable. The
classic mistake is trying to sort it with the query's outer `ORDER BY`,
which sorts the groups, not the values inside them.

## ex6 - money as text

What this tested: `to_char` on a number, and its habit of reserving a space
for the sign. The `9` pattern right-aligns and pads, so the raw result
begins with blanks; the `FM` prefix ("fill mode") suppresses them, and
`trim()` does the same job after the fact. The classic mistake is comparing
such a string against an expected literal without noticing the leading
space - the values look identical in a terminal.

## ex7 - mask the address

What this tested: composing locate, slice and repeat into one expression -
the shape of every redaction, every "show last four digits", every partial
disclosure. Keeping the length identical is the constraint that makes it
interesting: `repeat('*', at_pos - 2)` is exactly the number of hidden
characters, and getting the `- 2` right requires actually counting on one
example. The reference does it with `overlay`, which replaces a slice in
place and states the intent more directly.

## ex8 - the commonest first word

What this tested: a derived grouping key, plus top-N. `split_part(name, '
', 1)` gives the adjective, the `GROUP BY` counts them, and the tie-break on
the word itself makes the "top five" reproducible when several adjectives
tie - which they will, since the generator draws from a small vocabulary.
The classic mistake is grouping by the alias while ordering by the count and
omitting the second sort key, so the report shuffles between runs.

## Further reading

- [String Functions and Operators](https://www.postgresql.org/docs/16/functions-string.html) - `length`, `position`, `overlay`, `repeat`, `initcap`, `format` and the rest, with their exact signatures.
- [Aggregate Functions](https://www.postgresql.org/docs/16/functions-aggregate.html) - `string_agg` and `array_agg`, including the `ORDER BY` allowed inside an aggregate call.
- [Data Type Formatting Functions](https://www.postgresql.org/docs/16/functions-formatting.html) - `to_char` for numbers, the `9` and `0` patterns, and the `FM` prefix.
- [Character Types](https://www.postgresql.org/docs/16/datatype-character.html) - `text` against `varchar(n)` and `char(n)`, and why the padded type is a trap.
