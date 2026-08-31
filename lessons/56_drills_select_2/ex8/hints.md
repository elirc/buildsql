## Hint 1
Nothing new: four bare columns and three expressions you have already
written in this set. The difficulty is only in keeping seven items in the
right order.

## Hint 2
Column 7 is the package, so it must include the salary itself: write
`salary + salary * 0.15` as the worksheet specifies. Returning just the bonus
again in position 7 is the failure this column is here to catch.

## Hint 3
Build it incrementally: get columns 1 to 4 running, then append column 5,
run it, then 6, then 7. A seven-column list is where a misplaced comma is
hardest to spot, and each intermediate run costs you nothing.
