## Hint 1

Any aggregate becomes a running one when its window is ordered, `count` included.

## Hint 2

`count(*) OVER (ORDER BY hired_on, id)`. Keep the `id` in the ordering - several people share a hire date, and without it they would all report the same headcount.
