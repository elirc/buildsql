## Hint 1

The dimension you group by (`country`) comes from one table and the measures come from the other. Join first, then group.

## Hint 2

After this join one row is one order, so `count(*)` counts cancelled orders - not customers, and not countries.
