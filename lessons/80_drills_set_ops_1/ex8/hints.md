## Hint 1
Three sets and two operators: an OR between the first two, an AND against the third. Write the sentence out and notice that the OR has to happen first.

## Hint 2
`INTERSECT` binds tighter than `UNION` and `EXCEPT`, exactly as multiplication binds tighter than addition. So `A UNION B INTERSECT C` is silently read as `A UNION (B INTERSECT C)` - which answers a different question and returns a plausible number of rows.

## Hint 3
Parenthesise the `UNION` explicitly: `(A UNION B) INTERSECT C`. The same result can be written with no set operators at all, as a `WHERE` clause on `products` combining two `EXISTS` subqueries with `OR` - worth writing both and comparing.
