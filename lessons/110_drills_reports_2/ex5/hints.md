## Hint 1

Per 2023 signup month: everybody, and the subset who ordered within 30 days of their own signup. The deadline is per-customer - c.created_at + interval '30 days' - not a fixed date.

## Hint 2

Build the fast-buyer set once (join customers to orders, keep o.created_at < c.created_at + interval '30 days', DISTINCT customer), LEFT JOIN it back to the cohort population, and count both columns per cohort. count(f.id) skips the NULLs of the non-converters - lesson 66's counting trick doing real work.

## Hint 3

Equivalent and tidier: a customer converted fast if and only if their FIRST order beat the deadline, so min(created_at) per customer in a CTE also answers it - the reference does that. Note the last cohorts have not had a full 30 days of runway; a real report would say so.
