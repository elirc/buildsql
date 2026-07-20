## Hint 1
Copy the query from the README into solution.sql - that's all the
editing this exercise needs. Then run the gate and *read* the plan it
prints if anything surprises you.

## Hint 2
If the gate says it expected a Seq Scan and found something else: did
you add an index on `total` to ex2/indexes.sql? Don't - the exercise is
about the provided index failing to apply.
