## Hint 1
Same daily CTE as ex1; the window is an `avg` with an explicit ROWS frame:
6 preceding through current row. Round the whole window expression.

## Hint 2
```sql
round(avg(revenue) OVER (ORDER BY day
                         ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) AS ma7
```
