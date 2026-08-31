## Hint 1
Two things per manager: a number that is an aggregate of the group, and a name that is not. A name cannot be produced by `count` or `avg`, so it has to come from somewhere the `GROUP BY` cannot reach.

## Hint 2
Count the reports with a self-join and a `GROUP BY` on the manager. For the name, either a correlated subquery that orders that manager's reports and takes the first, or a separate ranked query joined back on `manager_id`.

## Hint 3
The tie-break is load-bearing: `ORDER BY salary DESC, id` inside whichever construct you choose, so that two reports on identical salaries always resolve the same way. `DISTINCT ON (manager_id)` with that same ordering is the compact PostgreSQL spelling of "one row per manager, the best one".
