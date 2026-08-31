## Hint 1
`ORDER BY` accepts any expression, not just a column name. The expression
does not have to appear in the SELECT list.

## Hint 2
`price % 1` is the remainder after dividing by one - the cents. Expect
heavy ties at `0.99`, which is exactly why the prompt gives you an `id`
tie-break.
