## Hint 1
Three measures over three different subsets of the same group, and the join may only happen once. Nothing may move into `WHERE` - the customers with no orders still need a row of zeros.

## Hint 2
`FILTER (WHERE ...)` restricts one aggregate to part of its group: `count(o.id) FILTER (WHERE o.status = 'cancelled')`. The revenue column needs one more thing than the counts do, because a sum over an empty subset is NULL rather than 0.
