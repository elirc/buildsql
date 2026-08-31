## Hint 1

A gap exists between consecutive orders of the same customer - lag() partitioned by customer (lesson 16), ordered by time. Averaging the gaps is a second stage, because window results cannot feed an aggregate in the same query.

## Hint 2

gap_days = created_at::date - (lag(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id))::date. Each customer's first order has no predecessor - its NULL gap must not count, and avg() skips NULLs, so it does not.

## Hint 3

Sanity-check with algebra: a customer's gaps telescope, so the sum of everyone's gaps is sum(last order date - first order date) and the gap count is sum(orders - 1) over customers with 2+ orders. The reference computes the average that way - no window at all. If your number disagrees with it, your window probably crossed customers.
