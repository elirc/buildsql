## Hint 1

Two filters again: `status = 'paid'` decides which rows are summed, `sum(total) > 15000` decides which customers survive.

## Hint 2

The status filter must be in `WHERE`. In `HAVING` it would be rejected outright, because `status` is neither grouped nor aggregated.
