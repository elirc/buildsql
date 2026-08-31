## Hint 1
A date literal is written as a quoted string; PostgreSQL will compare it
to a `date` column without complaint, and you can be explicit with
`DATE '2015-01-01'` or `'2015-01-01'::date`.

## Hint 2
"Before 1 January 2015" excludes 1 January 2015 itself. Strict `<` is
right; `<=` would let anyone hired on New Year's Day in.
