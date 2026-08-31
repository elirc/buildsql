## Hint 1
Both conditions read the same table, in the same window, with different ratings - and one of them is a presence while the other is an absence. They cannot share a single join.

## Hint 2
`EXISTS (... rating = 5 ...)` and `NOT EXISTS (... rating = 1 ...)`, each correlated on `r.product_id = p.id` and each carrying the date window. A single join with `rating = 5 AND rating <> 1` is a different and much weaker claim: it only says one particular review is a five, not that no review is a one.
