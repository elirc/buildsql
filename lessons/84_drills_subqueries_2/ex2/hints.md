## Hint 1
The mirror of the previous problem: the product only has to beat **one** member of the list, not all of them.

## Hint 2
`price > ANY (SELECT ...)`, which is the same as comparing against the minimum of the list. `SOME` is a synonym for `ANY` if you ever meet it. Note that `= ANY (...)` is precisely what `IN (...)` means.
