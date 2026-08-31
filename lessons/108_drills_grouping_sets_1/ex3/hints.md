## Hint 1

The total row should say 'all statuses', not NULL - and the honest way to detect the total row is GROUPING(), not a NULL test (lesson 50).

## Hint 2

CASE WHEN GROUPING(status) = 1 THEN 'all statuses' ELSE status END, over GROUP BY ROLLUP (status). GROUPING(status) returns 1 exactly on rows where status was rolled away.
