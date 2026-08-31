## Hint 1

Write the naive version first and run it. Zero rows is the expected first result, and understanding why is the whole exercise.

## Hint 2

`NOT IN` means `<> ALL`, and every comparison against `NULL` is `NULL` rather than true - so the CEO's `NULL` `manager_id` poisons the test for every staff row. Remove that value from the subquery's output.
