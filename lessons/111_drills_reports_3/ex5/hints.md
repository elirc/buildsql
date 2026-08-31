## Hint 1

Three facts per category - its total revenue, its best product, and that product's revenue - all derived from one per-product revenue table. Build that table once in a CTE and ask it both questions.

## Hint 2

From the per-product CTE: DISTINCT ON (category) ... ORDER BY category, revenue DESC, id picks the flagship; a second grouped pass (or a window sum) gets the category total.

## Hint 3

The share divides the flagship's revenue by the category total - 100.0 * revenue / cat_rev, rounded to 1. The window formulation carries both row_number() and sum() OVER the same partition, answering everything in one pass; the two-CTE join is the same report spelled longhand.
