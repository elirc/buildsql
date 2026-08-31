## Hint 1

Nothing here is new express — it is ex1, ex3 and ex5 used deliberately. The
change of perspective is that the path segment and the storage are *arguments*,
so the same function body serves `notes` and `tags` without knowing either name.

## Hint 2

Build a `express.Router()` per call, register `"/"` and `"/:id"` on it, and
`app.use("/" + spec.name, router)`. Relative paths inside the router mean the
resource name appears exactly once, in the mount.

Each call gets its own router **and** its own closure over `spec.store`. If you
hoist the store into a variable outside `mountResource`, the second mount
silently shares the first one's data — which is the failure the gate checks by
creating a tag and then counting the notes.

## Hint 3

Two places leak the resource name if you are not careful: the `Location` header
on the create, which has to be `/tags/t2` and not `/t2`, and the 404 body, which
must stay the same shape for every resource so one client error handler covers
them all.

What is left for you to decide is whether `mountResource` should also mount
`express.json()`. The gate does it on the app, which is the arrangement that
scales — but a reviewer will ask whether a resource ought to declare its own
body parsing, and there is a real answer either way.
