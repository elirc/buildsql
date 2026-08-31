## Hint 1

A one-per-group pick (lesson 49) where the group key lives on the OTHER side of a join: the review's category comes from products. Join first, then pick.

## Hint 2

DISTINCT ON (p.category) over reviews joined to products, ORDER BY p.category, r.created_at DESC, r.id DESC - the higher review id settles same-second ties, and one million reviews make those ties real.
