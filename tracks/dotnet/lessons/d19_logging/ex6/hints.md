## Hint 1

Delete, do not rewrite. "Entering Complete" and "Leaving Complete" are what a
debugger is for, and the line count and the item count are not separate events -
they are fields of the one event that happened.

## Hint 2

Two paths, one entry each. The 404 path logs once and returns; the success path
computes `items` and then logs once:

    logger.LogInformation("Pick {PickId} completed with {Items} items", pick.Id, items);

The gate counts entries, so an extra line anywhere fails even if every one of
them is well written.
