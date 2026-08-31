SELECT r.rating,
       r.rating / 2 AS halved_int,
       r.rating / 2.0 AS halved_numeric
FROM reviews AS r
GROUP BY r.rating;
