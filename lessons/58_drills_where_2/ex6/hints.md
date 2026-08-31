## Hint 1
"Neither A nor B" is the negation of "A or B". Write it that way first,
then try pushing the `NOT` inside the brackets and see what the connective
becomes.

## Hint 2
De Morgan: `NOT (a OR b)` is `NOT a AND NOT b`. The `OR` turns into an
`AND`. Writing `dept <> 'sales' OR dept <> 'support'` instead returns every
row in the table, because no department can be both.
