## Hint 1

DISTINCT ON takes any expression, not just a column - here the group key lives inside a JSONB document (lesson 19's double-arrow).

## Hint 2

DISTINCT ON (attributes ->> 'size') with ORDER BY attributes ->> 'size', price ASC, id ASC. The leading ORDER BY expression must match the DISTINCT ON expression exactly, character for character as far as the parser cares.
