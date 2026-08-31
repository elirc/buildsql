# Reading - 60_drills_order_limit_1

Ordering, drilled. The syntax is five minutes; the discipline of making an
order *total* is the part that takes practice.

## Notes

`ORDER BY` takes a list of keys, each with its own direction, and applies
them left to right: the second key only decides between rows the first key
tied. `ASC` is the default and `DESC` reverses only the key it is attached
to - `ORDER BY a, b DESC` sorts `a` ascending and `b` descending, which is
not what a hurried reader assumes.

The rule that matters most in this set is **totality**. If your sort keys do
not uniquely determine an order, the rows that tie come back in whatever
sequence the executor produced them, and that sequence is an implementation
detail: it can change between runs, between plans, and between PostgreSQL
versions. Adding a unique column - here, always the primary key - as the last
key makes the order total and the query reproducible. That is why every
prompt in this set names its tie-break, and it is what an interviewer is
listening for when they ask "what if two rows have the same revenue?".

`LIMIT` then takes the first N rows *of that order*. PostgreSQL does not
sort everything and throw the rest away - for a small N it uses a top-N heap
sort, which is why `ORDER BY ... LIMIT 10` over a very large table is fast
and `ORDER BY ...` without the limit is not.

## ex1 - the longest-serving staff

This tests the basic shape - sort ascending, take the first N - and the habit
of appending a unique tie-break. The classic mistake is omitting `id`, which
usually passes and occasionally does not, which is the worst possible
failure mode. The model answer sorts by date then by key. `FETCH FIRST 10
ROWS ONLY` in the reference is the SQL-standard spelling of `LIMIT 10`; both
plan identically in PostgreSQL.

## ex2 - sorting text

This tests text ordering and the lesson hiding inside it: a string sort is
not a numeric sort. The classic mistake is reading the output as broken
because `1372` precedes `141`, and then "fixing" it with a cast the prompt
did not ask for. The model answer sorts the text as text. Text collation is also
locale-dependent, which is why the same query can order differently on a
database initialised with a different `LC_COLLATE`.

## ex3 - grouped alphabetically by country

This tests multi-key ordering and the left-to-right precedence of sort keys.
The classic mistake is writing the keys in the order the columns appear in
the SELECT list rather than the order the report needs. The model answer
follows the prompt exactly. The reference sorts by output position - `ORDER
BY 3, 2, 1` - which is legal, occasionally handy, and a maintenance hazard
the moment somebody edits the SELECT list.

## ex4 - the newest reviews

This tests per-key sort direction, the detail that catches people who assume
`DESC` applies to everything after it. The classic mistake is exactly that -
one `DESC` at the end of a two-key list, producing the oldest reviews with a
descending id tie-break. The model answer marks both keys. Note how cheap
this is despite the table size: a top-N sort keeps only ten rows in memory
while it scans.

## ex5 - the second page

This tests `OFFSET` as pagination and the off-by-one everybody makes once.
The classic mistake is `OFFSET 26`, which quietly drops the first row of page
two. The model answer skips exactly one page's worth. Worth knowing for later:
`OFFSET` gets slower the deeper you page, because the server still produces
and discards every skipped row - lesson 52 replaces it with keyset
pagination.

## ex6 - newest hire in each department

This tests mixed sort directions across three keys. The classic mistake is
reading "newest first in each department" as a per-group top-N and reaching
for window functions - the prompt asks only for a listing, and `ORDER BY`
plus `LIMIT` is the whole answer. The model answer marks each key's direction
independently. Recognising which of the two problems you have been handed is
a real interview skill.

## ex7 - sorting by an expression

This tests sorting by a computed value and the necessity of a tie-break when
the sort key has few distinct values. The classic mistake is omitting `id`
and getting a different twenty rows on a different run, because a hundred
products share each cents value. The model answer sorts by the expression and
breaks ties on the key. An index on `(price % 1)` would make this cheap -
that is lesson 40's expression index.

## ex8 - three keys, mixed, on a large table

This tests a three-key sort with a direction change in the middle, over a
table big enough that guessing does not work. The classic mistake is letting
one `DESC` leak onto the following keys, which reverses the date order inside
each country. The model answer states each direction explicitly - including
the `ASC`s, which are redundant to the parser and valuable to the reader.
Being explicit is free and it removes the ambiguity from review.

## Further reading

- [Sorting Rows](https://www.postgresql.org/docs/16/queries-order.html) - the ORDER BY clause: multiple keys, per-key direction, and NULL placement.
- [LIMIT and OFFSET](https://www.postgresql.org/docs/16/queries-limit.html) - the documentation's own warning that LIMIT without ORDER BY returns an unpredictable subset.
- [Collation Support](https://www.postgresql.org/docs/16/collation.html) - why sorting text is a locale question, not an ASCII one.
- [Use The Index, Luke - Sorting and Grouping](https://use-the-index-luke.com/sql/sorting-grouping) - the same clause seen from the index's point of view; you will re-read this in Part 5.
