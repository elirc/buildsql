## Hint 1
Column three converts the price to an `integer`. Ask yourself what that
makes the `/` in column four.

## Hint 2
`integer / integer` is integer division in SQL: the remainder is
discarded and no warning is issued. Column five divides the original
`numeric` instead, so it keeps its decimals until `round` shortens them.

## Hint 3
Three separate rules are stacked here and each one changes the answer:
the cast rounds rather than truncates, the division that follows it drops
the remainder, and the `numeric` division does neither. Get columns one to
three running, then add four and five one at a time and read every value on
a single row before moving on.
