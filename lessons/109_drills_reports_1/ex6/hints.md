## Hint 1

A two-column pivot (lesson 17): one row per category, weekday money in one column, weekend money in the other. The day-of-week test is lesson 18's extract(isodow ...), where Saturday is 6.

## Hint 2

Two filtered sums over the three-table join: sum(quantity * price) FILTER (WHERE extract(isodow FROM o.created_at) >= 6) for weekends, < 6 for weekdays, non-cancelled orders only. The FILTER condition reads the order's timestamp while the measure reads the line - that cross-table reach is why everything joins first.
