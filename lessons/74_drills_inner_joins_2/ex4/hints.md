## Hint 1

The month is a half-open range: `>= 2023-10-01 AND < 2023-11-01`. Writing `<= 2023-10-31` silently drops everything that happened during the last day.

## Hint 2

`count(*)` counts item lines here. The number of people needs `count(DISTINCT o.customer_id)`, because one customer can appear on many lines.
