## Hint 1

Two aggregations at different grains: first, each buyer's earliest order (per customer); then the average of those waits (per signup year). Collapsing them into one pass computes something else.

## Hint 2

Stage one: join customers to orders, GROUP BY customer, keep min(o.created_at) and the signup date. The wait in days is min(...)::date - c.created_at::date - date minus date is already an integer.

## Hint 3

Stage two groups stage one by signup year: count(*) is the buyers, round(avg(days), 1) the average wait. Customers who never ordered fall out at the join, which is what "among customers who bought" means - state that population note when you deliver numbers like these.
