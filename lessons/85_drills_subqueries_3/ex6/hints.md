## Hint 1

The value each row must beat depends on two things about that row: its department and its hire date. That means the subquery correlates on both.

## Hint 2

`WHERE s.salary > (SELECT avg(t.salary) FROM staff t WHERE t.department = s.department AND t.hired_on < s.hired_on)`. Think about what that comparison evaluates to for the very first hire in a department, and whether such a row should survive.

## Hint 3

`avg` over an empty set is `NULL`, and `salary > NULL` is `NULL`, which `WHERE` treats as "not true" - so the earliest hire in each department drops out on its own. No extra guard is needed.
