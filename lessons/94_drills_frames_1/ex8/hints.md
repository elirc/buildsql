## Hint 1

Two trailing averages over the same weekly series, differing only in how far back their frames reach.

## Hint 2

`ROWS BETWEEN 3 PRECEDING AND CURRENT ROW` gives four weeks; `ROWS BETWEEN 11 PRECEDING AND CURRENT ROW` gives twelve. Compute both in one CTE.

## Hint 3

The `CASE` compares the unrounded `ma4` and `ma12` from that CTE - comparing the rounded columns would flip the signal on weeks where the two are within a hundredth of each other.
