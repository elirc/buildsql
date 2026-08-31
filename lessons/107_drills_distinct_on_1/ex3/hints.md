## Hint 1

Five groups, three million rows, one survivor each - the construct does not change with table size. Event timestamps are unique (strictly increasing with id), so this is the rare case where no tie-break is needed.

## Hint 2

DISTINCT ON (event_type) ... ORDER BY event_type, ts DESC. Adding an id tie-break anyway costs nothing and is the habit worth keeping.
