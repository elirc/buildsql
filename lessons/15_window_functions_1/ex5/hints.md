## Hint 1
The window function is an ordinary expression - you can subtract it
from `price` and wrap the whole thing in `round(...)`.

## Hint 2
`round(price - avg(price) OVER (PARTITION BY category), 2) AS vs_category`
