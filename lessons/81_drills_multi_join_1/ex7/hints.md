## Hint 1
Two layers. First get revenue for every (country, category) pair; then, within each country, keep the best one. Trying to do both in a single `GROUP BY` is what makes this feel impossible.

## Hint 2
The inner layer is a four-table join grouped by country and category. For the outer layer, either `row_number() OVER (PARTITION BY country ORDER BY revenue DESC, category)` with `WHERE rn = 1` one level out, or `DISTINCT ON (country)` with the same `ORDER BY`.

## Hint 3
`max(revenue)` per country does not work, because it gives you the number without telling you which category produced it - and joining back on the number is fragile when two categories tie. The tie-break on `category` has to be inside whichever ranking construct you pick.
