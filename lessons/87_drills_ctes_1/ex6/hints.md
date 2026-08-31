## Hint 1

Three passes, not one: count orders per customer, attach a tier label to each customer, then count and sum the labelled rows.

## Hint 2

The `CASE` belongs in the second CTE's `SELECT` list, so the final query can simply `GROUP BY tier`. Remember that `CASE` arms are tested in order, so `WHEN orders >= 15` first and `WHEN orders >= 8` second gives you the 8-to-14 band without an explicit upper bound.
