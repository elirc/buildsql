## Hint 1

Two stages: first a plain lesson 08 aggregation (reviews per product, with the category carried through the join), then the ranked-CTE idiom over those counts.

## Hint 2

`row_number() OVER (PARTITION BY category ORDER BY reviews DESC, product_id)` on the counted rows, keep `rn <= 2`. Review counts are small integers, so ties are not a maybe - they are certain somewhere in six categories; the `product_id` tie-break is what makes the answer reproducible.
