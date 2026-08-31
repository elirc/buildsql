## Hint 1

One row, two columns - a two-cell pivot (lesson 17). The revenue is line-item money (quantity * price), the month filter lives on the order, the category on the product.

## Hint 2

Two filtered sums over the three-table join: sum(quantity * price) FILTER (WHERE category = 'books') and the electronics twin, October half-open, cancelled orders out.
