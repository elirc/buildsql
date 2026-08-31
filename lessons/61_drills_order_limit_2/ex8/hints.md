## Hint 1
Everything in this problem has appeared already: three keys with mixed
directions, plus an offset and a limit.

## Hint 2
Get the ordering right with no `OFFSET` at all and eyeball the first few
rows; only then add the paging. Debugging a sort through a hundred skipped
rows is needlessly hard.

## Hint 3
The skipped rows are still produced and discarded by the server, so this
query does about as much work as returning 125 rows. That is fine at 100 and
is the reason batch exports use a key range instead of an offset.
