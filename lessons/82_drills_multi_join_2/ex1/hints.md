## Hint 1
One row per category. The join grain is the review, so anything counting products has to say so explicitly.

## Hint 2
`count(*)` here counts reviews, which is what the second column wants. The first column wants products, and after the join each product appears once per review it has - `count(DISTINCT p.id)` is what collapses that back.
