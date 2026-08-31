## Hint 1

You may group by any expression, not just a column - and the same expression has to appear in the SELECT list for you to see which bucket a row belongs to.

## Hint 2

PostgreSQL accepts `GROUP BY 1` (the first SELECT item) or the expression repeated in full. Both work; the ordinal is shorter and breaks silently if anybody reorders the SELECT list.
