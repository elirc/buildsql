## Hint 1

The partition key is not a column - it is something you compute from one.

## Hint 2

`PARTITION BY extract(year FROM hired_on)` works directly, or name the year in a CTE first and partition by that column. Both give the same windows; the second is harder to get subtly wrong.
