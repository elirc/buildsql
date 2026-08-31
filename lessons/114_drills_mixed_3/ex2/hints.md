## Hint 1

Three stages: aggregate units per (week, product) over the joined October window, pick the best product per week, and fetch the name. Aggregation must come before the pick - you cannot pick a winner from unaggregated lines.

## Hint 2

date_trunc('week', o.created_at) buckets by Monday-started weeks - October 2023 spans six of them, edges partial. The pick is DISTINCT ON (week) ... ORDER BY week, units DESC, product_id, or the row_number() = 1 twin.
