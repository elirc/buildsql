## Hint 1
Three keys, all ascending, applied left to right: country decides first,
name breaks its ties, id breaks what is left.

## Hint 2
Key order is not column order. Writing `ORDER BY name, country` sorts the
whole table by name and only then by country, which is a completely
different listing.
