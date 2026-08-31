## Hint 1

One grouped pass over orders: a count and an average per status. Lesson 07 shape, nothing hidden.

## Hint 2

GROUP BY status with count(*) and round(avg(total), 2), ordered by status. Do not filter anything - "typical" here means all four statuses, cancelled included, so the reader can compare them.
