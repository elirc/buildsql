## Hint 1
Four measures at country grain plus one value that is not an aggregate at all - a product name. Those two things cannot come out of the same `GROUP BY`, so plan for two summaries joined at the end.

## Hint 2
Build the joined line-level rows once, in a CTE. Aggregate that CTE by country for the totals. Aggregate it again by country and product for the ranking, then keep the top row per country.

## Hint 3
`count(DISTINCT order_id)` for the order count, because the line grain repeats each order. `DISTINCT ON (country)` with `ORDER BY country, units DESC, product_id`, or `row_number()` partitioned the same way, for the best seller. The `product_id` tie-break is required by the prompt and is what makes the answer reproducible.
