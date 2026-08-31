## Hint 1

Grouping by a document field is grouping by an expression - nothing about
`jsonb` changes the shape of the query.

## Hint 2

`GROUP BY attributes->>'size'`, repeating the expression or using the
ordinal. Use the text arrow: grouping by `->` would give you quoted JSON
values.
