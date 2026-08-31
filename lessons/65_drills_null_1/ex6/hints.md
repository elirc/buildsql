## Hint 1

There is exactly one row in `staff` with no manager, and the result of this query should contain exactly one NULL - not none, and not one per rootless employee.

## Hint 2

One column, deduplicated with `DISTINCT` and sorted by that same column -
then check the last row of the output against the default NULL placement
from exercise 4. `GROUP BY` would produce the identical result.
