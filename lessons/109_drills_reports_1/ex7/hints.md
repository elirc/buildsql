## Hint 1

Monthly paid order counts first (a CTE), then each month against the one before - lesson 16's lag(). The percentage and the label both compare the same two numbers.

## Hint 2

lag(orders) OVER (ORDER BY month) is last month's count. change_pct is 100.0 * (orders - prev) / prev rounded to 1; January has no prev, so both computed columns are NULL there - division by NULL is NULL, no special casing needed for the pct.

## Hint 3

Naming the lag once in an intermediate CTE (SELECT ..., lag(...) AS prev) keeps the final SELECT readable and the CASE honest: WHEN prev IS NULL THEN NULL first, then the up/down/flat branches. Writing lag() four times inline also works - the reference and expected answers do one each.
