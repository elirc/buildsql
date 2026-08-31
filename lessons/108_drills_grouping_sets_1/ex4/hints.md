## Hint 1

Quarter contains month - the textbook hierarchy. Six month rows, two quarter subtotals, one grand total, all in one pass over the half-open first-half window.

## Hint 2

GROUP BY ROLLUP (date_trunc('quarter', created_at), date_trunc('month', created_at)). Order by qtr then month and every subtotal lands directly under its details, with the grand total (both NULL) last.
