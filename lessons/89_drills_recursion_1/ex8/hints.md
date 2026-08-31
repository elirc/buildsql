## Hint 1

This is the closure from exercise 6 with money attached: one row per (root, member) pair, then a `sum` of the members' salaries per root.

## Hint 2

Build the (root, id) pairs recursively, join `staff` on the walked id to get salaries, and group by `root` for `count(*)` and `sum(salary)`.

## Hint 3

The company payroll is `(SELECT sum(salary) FROM staff)`. Filter on the raw `subtree_payroll >= 0.05 * <that>`, not on the rounded percentage - and expect the percentages not to sum to 100, because subtrees contain one another.
