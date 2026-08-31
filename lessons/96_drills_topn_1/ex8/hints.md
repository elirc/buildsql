## Hint 1

Three layers, each one a lesson: join orders to customers for the country (08), count per customer (07), rank within country and keep the winner (15). Build them in that order and test each layer as you go.

## Hint 2

The counting CTE groups by `country, customer_id` - a customer lives in one country, so this is really a per-customer count with the country carried along for the partition that follows.

## Hint 3

`row_number() OVER (PARTITION BY country ORDER BY orders DESC, customer_id ASC)`, keep `rn = 1`, order by `country`. Order counts are small integers, so two customers tying at the top of a country is entirely possible - the prompt's "smallest customer id wins" rule is the `customer_id ASC` in the window, not a wish.
