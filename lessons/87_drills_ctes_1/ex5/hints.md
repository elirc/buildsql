## Hint 1

Count customers per country from `customers` alone, and count orders per country by joining `orders` to `customers`. Two independent aggregates, then a join.

## Hint 2

The third CTE divides one by the other. Cast before you divide - `orders::numeric / customers` - or integer division will flatten every country to the same whole number.

## Hint 3

The final filter compares each row's ratio to the average ratio across the third CTE, so that CTE is read twice: once by the outer `FROM`, once by `(SELECT avg(orders_per_customer) FROM rated)`.
