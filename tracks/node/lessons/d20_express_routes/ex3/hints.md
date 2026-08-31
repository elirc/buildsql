## Hint 1

A `Router` is its own little world, and by default `req.params` inside it holds
only the parameters its own routes declared. The mount path's `:projectId` is
not one of those.

## Hint 2

`express.Router({ mergeParams: true })` is the switch. With it, the parent's
parameters are merged into `req.params` for every route in the router; without
it you get `undefined` and a filter that silently matches nothing — the worst
kind of bug, because the endpoint answers `200` with an empty list.

Mount with `app.use("/projects/:projectId", router)` and write the routes inside
relative to that: `"/notes"`, not `"/projects/:projectId/notes"`.

A `router.use()` guard at the top of the router runs for every route in it, so
"is this a real project" is answered once rather than in each handler.
