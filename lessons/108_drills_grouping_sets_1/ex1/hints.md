## Hint 1

Five department rows plus one all-staff row from a single scan - lesson 50's one-level hierarchy. The extra row carries NULL in the rolled-up column.

## Hint 2

GROUP BY ROLLUP (department) produces the per-department groups and the grand total in one go. ORDER BY department puts the NULL total row last, because ascending sorts place NULLs last by default.
