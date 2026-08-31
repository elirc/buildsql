WITH tiers(tier, lo, hi) AS (
    VALUES ('budget', 0, 100), ('mid', 100, 300), ('premium', 300, 500)
)
SELECT t.tier, t.lo, count(p.id) AS products
FROM tiers t
LEFT JOIN products p ON p.price >= t.lo AND p.price < t.hi
GROUP BY t.tier, t.lo
ORDER BY t.lo;
