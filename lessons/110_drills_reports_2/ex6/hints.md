## Hint 1

Two aggregations stacked: first the per-customer measure (how many distinct event types they triggered), then the distribution of that measure (how many customers share each value). Lesson 68 called it the aggregate of an aggregate.

## Hint 2

CTE one: GROUP BY customer_id with count(DISTINCT event_type). CTE two: group the first result by that count and count customers. Only customers appearing in the stream are counted - the request said "of the people we saw", and that population note belongs with the answer.
