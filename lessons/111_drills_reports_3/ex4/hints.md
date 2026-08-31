## Hint 1

Each row needs its own department's average sitting next to it - a window average (lesson 15), or equivalently a grouped CTE joined back. "20 percent or more below" compares salary against 0.8 times that average.

## Hint 2

avg(salary) OVER (PARTITION BY department) puts the benchmark on every row, but a window result cannot be referenced in the same query's WHERE - wrap it in a CTE and filter outside.

## Hint 3

Filter with salary <= 0.8 * dept_avg (the unrounded average), and sort by the unrounded gap ratio descending with id as tie-break. Rounding first and then filtering on the rounded value shifts people across the 20.0 boundary - display math and decision math are different math.
