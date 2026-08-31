## Hint 1

The whole behaviour is two lines in the returned function: clear the timer you
armed last time, then arm a new one. That is what "restarts the wait" means, and
it is why the gate can assert that the timer count never goes above one.

The arguments are the other piece of state: store them on every call so the one
that finally runs uses the most recent set.

## Hint 2

Returning a function that also has `cancel` and `pending` on it means building
the function first and then assigning the extra properties. TypeScript needs a
nudge for that — declare the interface, build the arrow function, and assert it
to the interface type before attaching the methods.

## Hint 3

Two bits of housekeeping decide the last four assertions.

Inside the timer callback, clear the handle **before** calling `fn` — otherwise
`pending()` still reports `true` while the debounced call is running, and a
`fn` that calls the debounced function again would clear a handle that has
already fired.

And decide what `cancel()` does to the stored arguments. Leaving them behind is
harmless today; say out loud why, and whether you would still say it if the
arguments were a 5MB request body.
