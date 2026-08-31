## Hint 1
The same two lists as the previous problem, stacked without any deduplication - so a Mexican customer who also signed up before 2022 appears twice.

## Hint 2
`UNION ALL` instead of `UNION`. It is not just a different result, it is a different amount of work: `UNION` has to sort or hash the whole output to find duplicates, `UNION ALL` simply concatenates. Compare your row count with ex1's - the difference is the overlap.
