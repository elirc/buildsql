## Hint 1
Two questions stacked: "what did each customer spend?" and "who are the top
three inside each country?". The first collapses rows, the second ranks
inside groups. Do them in that order, in two layers.

## Hint 2
CTE one: `customers` joined to non-cancelled `orders`, `GROUP BY c.country,
c.id, c.name`, `sum(o.total) AS revenue`. CTE two: add `row_number() OVER
(PARTITION BY country ORDER BY revenue DESC, id)`. Then `WHERE rn <= 3`.

## Hint 3
Two details the gate will hold you to. The cancelled filter belongs with the
join or in `WHERE` -- it is what "revenue" means here. And the `, id`
tie-break must appear in *both* the `OVER (... ORDER BY ...)` and the final
`ORDER BY`, or two customers on identical revenue will come back in an order
the planner chose and you did not.
