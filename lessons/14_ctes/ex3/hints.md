## Hint 1
Base case: the one row with no manager, depth 1. Step: staff whose
manager_id equals the id of a row already found, depth + 1. UNION ALL
between them, inside WITH RECURSIVE.

## Hint 2
The concept section's block *is* the answer — but before using it, answer
for yourself: what makes the recursion stop? (When a step produces zero
new rows — the deepest level has no reports.)
