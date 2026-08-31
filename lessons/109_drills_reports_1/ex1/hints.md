## Hint 1

"Last month" is October 2023, "how much did we make" is paid orders only, and all three numbers come from one filtered aggregate - no grouping at all.

## Hint 2

WHERE status = 'paid' AND created_at >= '2023-10-01' AND created_at < '2023-11-01', then count(*), sum(total), and round(avg(total), 2) in one SELECT. Half-open date ranges, as always with timestamps.
