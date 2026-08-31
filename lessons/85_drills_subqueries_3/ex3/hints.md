## Hint 1

Two hops up the org chart: first turn the staff row's `manager_id` into that manager's own `manager_id`, then turn that id into a name.

## Hint 2

Nest one scalar subquery inside another: the outer one selects `g.name FROM staff g WHERE g.id = (...)`, and the inner one supplies the grandparent's id. Both return `NULL` when there is no such row, which is exactly what the prompt asks for.
