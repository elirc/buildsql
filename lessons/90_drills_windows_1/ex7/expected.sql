SELECT category, id, name, price, category_rank, overall_rank
FROM (SELECT category, id, name, price,
             row_number() OVER (PARTITION BY category
                                ORDER BY price DESC, id) AS category_rank,
             row_number() OVER (ORDER BY price DESC, id) AS overall_rank
      FROM products) t
WHERE category_rank <= 3
ORDER BY category, category_rank;
