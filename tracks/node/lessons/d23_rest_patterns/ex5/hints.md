## Hint 1

Every route under `/projects/:projectId/...` owes two checks: does the parent
exist, and does the child belong to *this* parent. Put the first one in a
middleware in front of all of them rather than at the top of each — three copies
of a guard is two chances to forget it.

## Hint 2

The distinction the gate is really testing: a missing parent is a **404**, not
an empty list. `[]` is a true statement about a project that exists and has no
tasks; returning it for a project that does not exist tells the client something
false and hides a typo in its own url.

The second check is the security one. `tasks.find((t) => t.id === req.params.id)`
looks complete and is not — the task is found through *any* parent, so guessing
an id reads somebody else's data. Match on the id **and** the parent, every
time.

And a `Location` for a nested resource is the nested path, not `/tasks/task-1`.
The header is a promise that the url works.
