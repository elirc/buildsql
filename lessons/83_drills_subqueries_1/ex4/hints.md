## Hint 1
The mirror of the previous problem: keep the products whose id is **not** in the list.

## Hint 2
`NOT IN` is safe here for one specific reason - `reviews.product_id` is declared `NOT NULL`, so the list can never contain a NULL. Against a nullable column it would silently return nothing at all, which is what drill set 78 made you feel. `NOT EXISTS` has no such condition and is the habit worth defaulting to.
