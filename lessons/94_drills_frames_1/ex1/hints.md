## Hint 1

The window has to look one row back and one row forward from wherever it is standing.

## Hint 2

`avg(revenue) OVER (ORDER BY month ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING)`. Nothing special is needed at the edges - the frame simply contains fewer rows there.
