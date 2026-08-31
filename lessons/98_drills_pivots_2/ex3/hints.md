## Hint 1

The last column is a claim about the entire department, so it has to be
built from an aggregate - not from a row-level test, which would give you
one answer per employee.

## Hint 2

Count the employees that would break the claim and compare that count to
zero, or take `max(hired_on)` and compare it to the boundary date. Either
expression yields a boolean column directly; no `CASE` is needed around it.
