# Reading - 103_drills_regex_1

Eight drills on POSIX regular expressions inside SQL: testing, filtering,
extracting, rewriting and splitting. Read after your attempt, pass or fail.

## Notes

PostgreSQL offers three pattern languages and it is worth knowing why. `LIKE`
is simple and indexable with the right operator class; `SIMILAR TO` is a
regrettable SQL-standard hybrid that nobody should reach for; POSIX regular
expressions - `~`, `~*`, `!~`, `substring(x FROM pattern)`,
`regexp_replace`, `regexp_match`, `regexp_split_to_array` - are the real
tool. Three habits keep them honest. Anchor deliberately: without `^` and
`$` a pattern matches anywhere, so `'[0-9]{2}'` is true for a
three-digit string too. Escape the characters that mean something - a bare
`.` matches any character, which makes `'user@example.com'` match
`'userXexample!com'` as well. And remember that a regular expression cannot
use an ordinary B-tree index, so a `WHERE name ~ '...'` on a large table is
a sequential scan; when the pattern is a plain prefix, `LIKE 'abc%'` can use
an index and the regex cannot.

## ex1 - does it match

What this tested: that `~` is an operator returning a boolean, so it belongs
in a SELECT list as comfortably as in a `WHERE`. Seeing the true and false
values side by side with the data is the fastest way to debug a pattern -
much faster than filtering and wondering why nothing came back. The classic
mistake is omitting the `^`, which would let a match start anywhere in the
address.

## ex2 - the pattern as a filter

What this tested: full anchoring, and escaping the dot. `^...$` pins the
pattern to the whole string; `\.` (or a bracketed `[.]`) makes the dot
literal rather than "any character". Ninety rows is the check: exactly the
customers with two-digit ids, from 10 to 99. The classic mistake -
forgetting the escape - passes this dataset silently, because every address
really does contain a dot there, and only breaks on data you have not seen.

## ex3 - pull out the number

What this tested: `substring(string FROM pattern)`, which returns the
matching text rather than a boolean - and returns NULL when there is no
match, which is the behaviour that makes it usable in a SELECT list. The
`$` anchor is what makes it the *trailing* number; without it the pattern
would still find the same digits here, but only because there is nothing
earlier to find.

## ex4 - take the number off

What this tested: `regexp_replace`, and the fact that the space is part of
what has to go. Matching `'\s*[0-9]+$'` consumes the separator too, which is
tidier than replacing the digits and then trimming - though the reference
shows the trim version, because in real data you rarely know which
whitespace is there. Note that `regexp_replace` without the `'g'` flag
replaces the first match only, which is correct here and wrong in ex6.

## ex5 - a case-insensitive census

What this tested: `~*` inside a `FILTER` clause - a conditional aggregate
whose condition happens to be a pattern. The alternative,
`lower(name) ~ '^[aeiou]'`, is equally correct and is the one that can use a
functional index. The classic mistake is `~ '^[aeiouAEIOU]'`, which works
until somebody adds an accented character and quietly stops.

## ex6 - strip the punctuation

What this tested: the `'g'` flag. Without it `regexp_replace` removes only
the first offending character, so `Dr. Barbara Collins PhD` loses its dot
and keeps everything else - a bug that looks like a success on most rows.
The character class is negated: `[^A-Za-z ]` is "anything that is not a
letter or a space", and `[^[:alpha:] ]` is the locale-aware spelling of the
same idea.

## ex7 - three captures at once

What this tested: capture groups. `regexp_match` returns a `text[]` of the
groups - not of the whole match - so `[1]`, `[2]`, `[3]` are the three
pieces, and the array is NULL when the pattern does not match at all, which
propagates cleanly. The classic mistake is expecting element 0 to hold the
full match, as in most programming languages; PostgreSQL arrays start at 1
and `regexp_match` returns only the groups. The reference uses
`regexp_replace` with backreferences instead, which is the trick to reach
for when you want the pieces reassembled rather than separated.

## ex8 - the names that do not fit

What this tested: negation plus splitting - the shape of a data-quality
audit. `!~` finds the rows a well-formed pattern rejects, and
`regexp_split_to_array` then measures how far off they are; `array_length`
of the result is the number of pieces. The classic mistake is `NOT name ~
'...'` written as `name ~ 'NOT...'` or, more subtly, an unanchored pattern,
which would accept `Dr. Barbara Collins PhD` because two plain words do
appear somewhere inside it.

## Further reading

- [Pattern Matching](https://www.postgresql.org/docs/16/functions-matching.html) - `LIKE`, `SIMILAR TO` and the POSIX regular expressions, with the full metacharacter table.
- [POSIX regular expression details](https://www.postgresql.org/docs/16/functions-matching.html#POSIX-SYNTAX-DETAILS) - greediness, bracket expressions and the character classes such as `[:alpha:]`.
- [String Functions and Operators](https://www.postgresql.org/docs/16/functions-string.html) - `substring`, `regexp_replace`, `regexp_match`, `regexp_split_to_array` and their flag arguments.
- [Indexes on expressions](https://www.postgresql.org/docs/16/indexes-expressional.html) - how `lower(col)` can be indexed when a case-insensitive pattern cannot.
