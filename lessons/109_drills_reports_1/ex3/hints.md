## Hint 1

"This quarter so far" is everything from October 1 onward - the data simply ends mid-November. "Real revenue" translates to excluding cancelled orders; the country lives one join away.

## Hint 2

Join orders to customers, filter status <> 'cancelled' AND created_at >= '2023-10-01', group by country, ORDER BY revenue DESC with country as tie-break, LIMIT 8.
