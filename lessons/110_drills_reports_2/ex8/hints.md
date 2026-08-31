## Hint 1

Two ratios, two denominators: the average order divides revenue by ORDERS, revenue per buyer divides the same revenue by DISTINCT customers. Everything comes from one grouped pass over non-cancelled 2023 orders.

## Hint 2

aov = round(sum(total) / count(*), 2) - or round(avg(total), 2), same number - and arpu = round(sum(total) / count(DISTINCT customer_id), 2). arpu can never be below aov, because a buyer places at least one order.

## Hint 3

Sanity check worth knowing: arpu / aov = orders per buyer. If your arpu comes out BELOW your aov, one of the denominators is counting the wrong thing - usually orders where buyers belong.
