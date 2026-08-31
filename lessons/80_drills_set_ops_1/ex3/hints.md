## Hint 1
Two independently computed sets of product ids, and you want the ones that appear in both. There is an operator for precisely that.

## Hint 2
`INTERSECT`. Both branches may produce a product id many times over - a product can have several bulk lines and several complaints - but `INTERSECT` (without `ALL`) deduplicates, so no `DISTINCT` is needed on either side.
