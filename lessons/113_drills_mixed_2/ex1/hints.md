## Hint 1

Text surgery as a grouping key (lesson 04 meets lesson 07): one character off the front of the name, then an ordinary count-sort-limit.

## Hint 2

GROUP BY left(name, 1), ORDER BY the count descending with the initial as tie-break, LIMIT 5. Adjacent letters tie easily at this scale - the tie-break is not decoration.
