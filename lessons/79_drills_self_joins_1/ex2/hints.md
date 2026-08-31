## Hint 1
Two people are teammates when they report to the same manager. Join `staff` to itself on `manager_id`, and think about what that join gives you before you filter anything.

## Hint 2
It gives you each person paired with themselves, and each real pair twice, once in each direction. `a.id < b.id` removes both problems at once - it is strictly less than, not `<>`. Note also that the join condition can never match the CEO, because `NULL = NULL` is not true.
