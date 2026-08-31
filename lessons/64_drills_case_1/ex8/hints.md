## Hint 1
A `CASE` is an expression, so it can appear anywhere an expression can -
including inside the `THEN` or `ELSE` of another `CASE`.

## Hint 2
Either shape works: nest one `CASE` inside the arms of another, or
flatten the four outcomes into a single ladder of four `WHEN` branches. Try
both and decide which you would rather review.

## Hint 3
If you flatten it, the branch order carries all the meaning: the
category-plus-price branch must come before the category-only branch, or
every expensive electronics product is labelled `volume`. If you nest it,
each inner `CASE` needs its own `END`, and the outer one needs one too.
