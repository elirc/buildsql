## Hint 1

A `static` field lives for as long as the process does. Each gate builds its
own `new DojoWebFactory()`, and every one of those hosts runs inside this one
process - so a static list is one list for all of them, while a singleton
registered in the container is one per host.

## Hint 2

`HoldDesk` is already registered in `Model.cs`, so a handler can simply ask for
it: add a `HoldDesk desk` parameter and let the container hand it over. Delete
both static fields; `desk.Place(...)` already assigns the id and `desk.All()`
already returns a copy.
