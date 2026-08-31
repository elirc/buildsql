## Hint 1

Each customer's first and last order are two one-per-group picks over the SAME rows with opposite sort directions, and the verdict is a CASE comparing what the two picks carried. Single-order customers have nothing to compare - filter them out by count.

## Hint 2

One shape: two DISTINCT ON CTEs (ORDER BY customer_id, created_at ASC / DESC, with id tie-breaks) plus a counts CTE with HAVING count(*) >= 2, joined on customer_id.

## Hint 3

The single-pass shape: number each customer's orders twice - row_number() ascending and descending - plus count(*) OVER, then aggregate with max(total) FILTER (WHERE rn = 1) for each end. Both spellings must agree exactly; if 'flat' never appears in either, that is correct - identical first and last totals are merely possible, not guaranteed.
