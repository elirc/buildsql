## Hint 1

Two aggregates per customer and a filter on the distance between them. The
filter is about the group, not about individual orders.

## Hint 2

`min(created_at)::date` and `max(created_at)::date`, then their difference.
The 300-day condition belongs in `HAVING` - or compute the aggregates in a
CTE and use an ordinary `WHERE` on the outside, which avoids writing the
expression three times.

## Hint 3

`WHERE customer_id <= 200` still belongs in `WHERE`: it restricts which rows
are aggregated, which is a different job from restricting which groups
survive. Sort by `span_days` descending with `customer_id` as the tie-break.
