## Hint 1

Same per-row lookup as ex2, with one requirement changed: a product must appear even when the lookup comes back empty. CROSS JOIN LATERAL drops such rows; something gentler keeps them.

## Hint 2

LEFT JOIN LATERAL (...) ON true is the keep-everything form - the ON true is required syntax. The subquery sorts that product's reviews by created_at DESC with r.id DESC as tie-break and takes LIMIT 1; missing reviews surface as NULLs.
