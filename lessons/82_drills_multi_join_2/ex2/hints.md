## Hint 1
The grouping column is the rating itself. `products` appears only to restrict the reviews to one category.

## Hint 2
Join `reviews` to `products`, filter the category in `WHERE`, and `GROUP BY r.rating`. The second measure is the number of **distinct** products that received that rating, not the number of reviews - those differ because a product can be rated 3 many times.
