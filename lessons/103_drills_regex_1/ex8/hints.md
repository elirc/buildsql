## Hint 1

Two halves: a negated, fully anchored match to find the odd names, and a
split to count how many words each of them has.

## Hint 2

`name !~ '^[A-Za-z]+ [A-Za-z]+$'` keeps the rows that do not fit the shape.
Anchoring matters more here than anywhere else in the set: unanchored, the
pattern would match inside almost every name and the audit would return
nothing.

## Hint 3

`regexp_split_to_array(name, ' ')` gives a `text[]`; `array_length(arr, 1)`
counts it. The set-returning `regexp_split_to_table` in a `LATERAL`
subquery, counted, is the same answer written as rows.
