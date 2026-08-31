## Hint 1

Three earlier ideas chained: pull the product id out of the path (this set's ex2), join it to products (lesson 08), and count per product (lesson 07). Nothing new - the work is keeping the cast in the join condition straight.

## Hint 2

The join condition is p.id = split_part(e.payload ->> 'path', '/', 3)::int, with WHERE event_type = 'view' narrowing the stream first. Group by the extracted id and the name.

## Hint 3

View counts per product sit close together, so two products can tie - which is why the prompt pins the order to views DESC, product_id ASC before the LIMIT 10. Leave the tie-break out and "the" top ten is not a well-defined set.
