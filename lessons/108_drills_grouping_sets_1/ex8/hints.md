## Hint 1

Two different NULLs collide here: the CEO's genuinely NULL manager_id, and the synthetic NULL ROLLUP writes on the total row. A NULL test cannot tell them apart. GROUPING() exists for exactly this.

## Hint 2

GROUPING(manager_id) is 1 only on the rolled-up total row - the CEO's row, whose NULL came from the data, reports 0. Branch on GROUPING first, then on IS NULL.

## Hint 3

CASE WHEN GROUPING(manager_id) = 1 THEN 'ALL' WHEN manager_id IS NULL THEN 'NOBODY' ELSE manager_id::text END - order of the branches matters, since the total row also passes the IS NULL test. Everyone reports to somebody except the CEO, so NOBODY carries exactly one head.
