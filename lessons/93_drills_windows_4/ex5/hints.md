## Hint 1

Group by band and category; partition by band alone. The band expression therefore appears twice.

## Hint 2

`GROUP BY floor(price / 100) * 100, category` and then `sum(count(*)) OVER (PARTITION BY floor(price / 100) * 100)`. The two expressions must be written identically or PostgreSQL will treat them as different keys.
