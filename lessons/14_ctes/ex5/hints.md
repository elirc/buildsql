## Hint 1
Base case `SELECT 1 AS n`, then `UNION ALL`, then a step that selects
from the CTE itself and stops via a WHERE.

## Hint 2
`WITH RECURSIVE nums AS (SELECT 1 AS n UNION ALL SELECT n + 1 FROM nums WHERE n < 12) SELECT n FROM nums;`
