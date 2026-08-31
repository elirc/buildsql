## Hint 1

Three topics: a filtered three-table join staged in a CTE, GROUPING SETS over it (by category, by status, and overall - no cross-tab), and a share-of-total column that needs the grand total available on every row.

## Hint 2

Stage the joined, filtered line revenue once in a base CTE; both the grouping-sets pass and the grand total read from it, so the two cannot disagree. GROUP BY GROUPING SETS ((category), (status), ()) gives exactly the nine rows.

## Hint 3

The pct needs the grand total NEXT TO each grouped row: compute it in its own one-row CTE and CROSS JOIN it after the grouping (dividing inside the grouped query forces awkward aggregates-of-constants). The () row divides by itself - its pct is 100.0, a free sanity check.
