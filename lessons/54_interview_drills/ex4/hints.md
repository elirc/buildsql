## Hint 1
Three layers. Which month did each customer's *first* order fall in? Did
that customer order again inside 30 days of that first order? Then count
customers per cohort month.

## Hint 2
`min(created_at) OVER (PARTITION BY customer_id) AS first_at` keeps every
order row *and* tells each one when the customer started -- which a
`GROUP BY` version would have thrown away. Collapse to one row per customer
with `bool_or(created_at > first_at AND created_at <= first_at + INTERVAL
'30 days')`.

## Hint 3
Two traps. `>` not `>=` on the first comparison, or the first order counts
as its own repeat and every cohort is 100% retained. And count with
`count(*) FILTER (WHERE repeated)` rather than a second query -- the
interviewer wants the cohort size and the retained count on the same row so
the ratio is readable.
