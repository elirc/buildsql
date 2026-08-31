## Hint 1

Same population as ex1, grouped by week. PostgreSQL weeks start on Monday (lesson 18), so the first "week of October" actually begins in late September.

## Hint 2

GROUP BY date_trunc('week', created_at) over the same paid-October filter. Expect six rows, with the first and last weeks only partially inside the month - say so when you hand a chart like this to the requester.
