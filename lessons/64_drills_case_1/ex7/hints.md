## Hint 1
Two `CASE` expressions side by side in the select list, each closed with
its own `END` and separated by a comma. They do not interact.

## Hint 2
Column 4 is a ladder and relies on first-match evaluation, so each
branch needs only its upper bound. Column 5 is an enumeration, so `IN`
lists or the simple `CASE` form both read well.

## Hint 3
Get column 4 right on its own first - five branches is where a missing
comma or a missing `END` hides best - then add column 5. Check one product
from each category and one from each band before you run the gate.
