## Hint 1

Two topics: a JSONB extraction as the grouping key (lesson 19) over a join to the money table (lesson 08). The colour lives on the product; the money lives on the line.

## Hint 2

Join order_items to products, filter category = 'clothing', GROUP BY attributes ->> 'color', sum quantity * price. Five colours, alphabetical.
