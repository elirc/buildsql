## Hint 1
For each person you want one value from a different row of the same table - the one immediately before them in hire order within their department. The very first hire has nobody before them and reports NULL.

## Hint 2
A correlated subquery ordered `hired_on DESC` with `LIMIT 1` picks the nearest earlier row. Use a row comparison, `(t.hired_on, t.id) < (s.hired_on, s.id)`, so that two people hired on the same day are still strictly ordered - Postgres compares row constructors left to right, like a compound sort key.

## Hint 3
The other answer is `lag(salary) OVER (PARTITION BY department ORDER BY hired_on, id)`, computed for the whole table and then filtered down to engineering **one level out** - a window function is evaluated after `WHERE`, so filtering in the same query would change which rows the window can see.
