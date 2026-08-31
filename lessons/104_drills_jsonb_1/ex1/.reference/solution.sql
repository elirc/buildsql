SELECT id,
       attributes #>> '{size}' AS size,
       jsonb_array_length(attributes #> '{tags}') AS tag_count
FROM products
WHERE id <= 20
ORDER BY 1;
