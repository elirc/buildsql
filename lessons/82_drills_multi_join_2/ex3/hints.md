## Hint 1
Two completely independent counts over two unrelated tables that happen to share a time axis. There is no join key between customers and orders that would give you this - a customer's signup month has nothing to do with the month their orders land in.

## Hint 2
Aggregate each table to one row per month in its own CTE, then join the two summaries on `month`. Both tables have rows in every month of the range, so an inner join is safe here; if they did not, this would need a `FULL JOIN`.
