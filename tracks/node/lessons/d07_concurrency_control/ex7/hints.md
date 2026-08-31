## Hint 1

Three pieces of state: the idle resources, the queue of waiting `resolve`
functions, and a count of how many have been created.

`acquire` is a three-way decision in this exact order: reuse an idle one, create
a new one if you are under `max`, otherwise queue. Getting the order wrong is
how a pool ends up creating `max` resources on the first `max` acquires even
when they are all coming back immediately.

## Hint 2

`release` is the mirror: if somebody is waiting, hand it straight to them —
never via the idle list, because a round trip through the list is a chance for
another caller to take it. Otherwise put it back.

This is ex1 with objects instead of permits, which is a good sentence to have
ready: a pool *is* a semaphore that remembers what it lent you.

## Hint 3

The double-release guard is the assertion most implementations miss. If the same
resource can be pushed onto the idle list twice, two later callers each get what
they think is an exclusive connection and start interleaving statements on it —
which produces a bug report about the database, not about your pool.

Checking membership before pushing is enough here. Two decisions are left: what
to do with a released resource nobody in this pool ever created, and whether
`size()` should count resources that have been created and thrown away — this
pool has no eviction, and a real one would.
