## Hint 1

Two pieces of state: the interval handle and the tick count. Note that you do
not need a separate `running` boolean — the handle already is one, as long as
you set it back to `undefined` when you clear it.

Keeping both a boolean and a handle is how they drift apart, and a `running`
flag that says `false` while a timer is still armed is the bug the gate's
`getTimerCount()` assertions are hunting for.

## Hint 2

Both `start` and `stop` need an early return, and they are mirror images: start
does nothing if the handle exists, stop does nothing if it does not.

The count is incremented inside the interval callback, before `onTick` is
called, so the first tick is 1 rather than 0 — and because it lives in the
closure rather than in `start`, restarting continues where it left off.
