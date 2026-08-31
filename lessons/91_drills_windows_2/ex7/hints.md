## Hint 1

If every product row carries its category's count and average, then all the rows of a category are identical once you select only those three columns.

## Hint 2

`SELECT DISTINCT category, count(*) OVER (PARTITION BY category), round(avg(price) OVER (PARTITION BY category), 2) FROM products` - no `GROUP BY` anywhere. `DISTINCT` runs after the windows, which is what makes this legal.
