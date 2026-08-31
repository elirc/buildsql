## Hint 1

`extends EventEmitter` gives you `on`, `once`, `off`, `emit` and the rest for
free — you write none of them. The only new state is the map holding the data.

`emit(name, ...args)` is synchronous: by the time it returns, every listener has
already run. That is worth remembering, because it means a listener that throws
takes your `set()` call down with it.

## Hint 2

Read the previous value **before** you overwrite it: the whole point of the
third argument is that the listener can see what changed, and once the map is
updated that information is gone.

The no-change rule needs care with a key that was never set. `previous ===
value` is not enough on its own to decide "unchanged" — think about what
`get` returns for a missing key and what that means if somebody legitimately
stores the same thing twice.

## Hint 3

`delete` has the same shape: capture the value, then remove, then decide whether
to announce anything. `Map.prototype.delete` already returns whether it removed
something, which is exactly the boolean you owe the caller.

The remaining decision is whether `set` should emit before or after the map is
updated. A listener that calls `get()` will see different things in the two
orders — pick one deliberately, because the answer to "is the store consistent
during the event" is something callers will build on.
