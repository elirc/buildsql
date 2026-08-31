## Hint 1
Three ideas you have already used: split the name, fold the case, glue
the pieces with `||`.

## Hint 2
The two literal pieces are `'.'` and `'@corp.example'`. Every operand of
`||` must be text - all of these already are, so no cast is needed here.

## Hint 3
Build it outwards from the middle. Get the two `split_part` calls
returning the right words, wrap each in `lower`, then add the separator, and
only then the domain. Checking the output at each step costs one run and
saves you from hunting a missing dot in a finished expression.
